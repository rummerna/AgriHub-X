/**
 * Digital Twin Farm – Simulation Adjustment Engine
 * Compares live weather data against crop thresholds to produce yield,
 * risk, and irrigation projections. Runs entirely client-side for privacy.
 */

import type { AggregatedWeather } from "@/data/weatherSources";

// ── Types ────────────────────────────────────────────────────────────────

export interface CropThreshold {
  crop_name: string;
  optimal_rainfall_min: number;
  optimal_rainfall_max: number;
  optimal_temp_min: number;
  optimal_temp_max: number;
  water_requirement_per_acre: number;
  pest_susceptibility_index: number;
  base_yield_per_acre: number;
  yield_unit: string;
}

export interface RegionClimate {
  region: string;
  country: string;
  historical_rainfall_avg: number;
  historical_temp_avg: number;
  seasonal_projection_rainfall: number | null;
  seasonal_projection_temp: number | null;
  drought_risk_index: number;
  flood_risk_index: number;
}

export interface FarmConfig {
  id: string;
  name: string;
  region: string;
  country: string;
  farm_size: number;
  crop_type: string;
  soil_type: string;
  irrigation_type: string;
}

export interface SimulationOutput {
  projectedYield: number;
  yieldChangePct: number;
  riskScore: number;
  pestRiskPct: number;
  waterUsageEstimate: number;
  irrigationRecommendation: string;
  profitProjection: number;
  insights: string[];
  droughtRisk: "Low" | "Medium" | "High";
  floodRisk: "Low" | "Medium" | "High";
  yieldUnit: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function riskLabel(val: number): "Low" | "Medium" | "High" {
  if (val < 30) return "Low";
  if (val < 60) return "Medium";
  return "High";
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ── Core Engine ──────────────────────────────────────────────────────────

export function runSimulation(
  farm: FarmConfig,
  weather: AggregatedWeather,
  climate: RegionClimate | null,
  threshold: CropThreshold | null,
): SimulationOutput {
  // Defaults if no threshold found
  const t = threshold ?? {
    crop_name: farm.crop_type,
    optimal_rainfall_min: 500,
    optimal_rainfall_max: 800,
    optimal_temp_min: 18,
    optimal_temp_max: 32,
    water_requirement_per_acre: 500,
    pest_susceptibility_index: 50,
    base_yield_per_acre: 2000,
    yield_unit: "kg",
  };

  const c = climate ?? {
    region: farm.region,
    country: farm.country,
    historical_rainfall_avg: 700,
    historical_temp_avg: 22,
    seasonal_projection_rainfall: null,
    seasonal_projection_temp: null,
    drought_risk_index: 25,
    flood_risk_index: 15,
  };

  const insights: string[] = [];

  // ─ Rainfall analysis ─
  const projectedRainfall = c.seasonal_projection_rainfall ?? c.historical_rainfall_avg;
  const rainfallRatio = projectedRainfall / c.historical_rainfall_avg;
  let yieldRainfallMod = 0;

  if (projectedRainfall < t.optimal_rainfall_min) {
    const deficit = ((t.optimal_rainfall_min - projectedRainfall) / t.optimal_rainfall_min) * 100;
    yieldRainfallMod = -clamp(deficit * 0.6, 0, 40);
    insights.push(`🌧️ Projected rainfall ${Math.round(projectedRainfall)}mm is below optimal (${t.optimal_rainfall_min}mm). Yield may drop ${Math.abs(Math.round(yieldRainfallMod))}%.`);
  } else if (projectedRainfall > t.optimal_rainfall_max) {
    const excess = ((projectedRainfall - t.optimal_rainfall_max) / t.optimal_rainfall_max) * 100;
    yieldRainfallMod = -clamp(excess * 0.3, 0, 25);
    insights.push(`🌊 Excess rainfall projected. Risk of waterlogging and fungal disease.`);
  } else {
    insights.push(`✅ Rainfall within optimal range for ${t.crop_name}.`);
  }

  // ─ Temperature analysis ─
  const currentTemp = weather.tempAvg;
  let yieldTempMod = 0;
  let pestBoost = 0;

  if (currentTemp > t.optimal_temp_max) {
    const excess = currentTemp - t.optimal_temp_max;
    yieldTempMod = -clamp(excess * 3, 0, 30);
    pestBoost = clamp(excess * 4, 0, 25);
    insights.push(`🌡️ Temperature ${currentTemp}°C exceeds optimal ${t.optimal_temp_max}°C. Yield -${Math.abs(Math.round(yieldTempMod))}%, pest risk +${Math.round(pestBoost)}%.`);
  } else if (currentTemp < t.optimal_temp_min) {
    const deficit = t.optimal_temp_min - currentTemp;
    yieldTempMod = -clamp(deficit * 2.5, 0, 25);
    insights.push(`❄️ Temperature ${currentTemp}°C below optimal ${t.optimal_temp_min}°C. Growth may slow.`);
  }

  // ─ Yield projection ─
  const totalYieldMod = yieldRainfallMod + yieldTempMod;
  const projectedYieldPerAcre = t.base_yield_per_acre * (1 + totalYieldMod / 100);
  const projectedYield = Math.round(projectedYieldPerAcre * farm.farm_size);
  const yieldChangePct = Math.round(totalYieldMod);

  // ─ Pest risk ─
  const basePest = t.pest_susceptibility_index;
  const humidityBoost = weather.humidity > 75 ? (weather.humidity - 75) * 0.8 : 0;
  const pestRiskPct = clamp(Math.round(basePest + pestBoost + humidityBoost), 0, 100);

  if (weather.humidity > 75) {
    insights.push(`💧 High humidity (${weather.humidity}%) increases fungal and pest risk.`);
  }

  // ─ Risk score ─
  const droughtIdx = rainfallRatio < 0.85 ? c.drought_risk_index + (1 - rainfallRatio) * 50 : c.drought_risk_index;
  const floodIdx = rainfallRatio > 1.2 ? c.flood_risk_index + (rainfallRatio - 1) * 40 : c.flood_risk_index;
  const riskScore = clamp(Math.round((droughtIdx + floodIdx + pestRiskPct) / 3), 0, 100);

  // ─ Water & irrigation ─
  const baseWater = t.water_requirement_per_acre * farm.farm_size;
  let irrigationRecommendation = "Normal";
  let waterMod = 1;

  if (farm.irrigation_type === "Rainfed") {
    if (projectedRainfall < t.optimal_rainfall_min) {
      irrigationRecommendation = "Consider supplemental irrigation";
      waterMod = 0.7;
      insights.push(`💡 Rainfed farm with low rainfall – consider supplemental irrigation.`);
    } else if (projectedRainfall > t.optimal_rainfall_max) {
      irrigationRecommendation = "Ensure drainage";
      waterMod = 0;
    } else {
      irrigationRecommendation = "Sufficient rainfall";
      waterMod = 0.2;
    }
  } else {
    if (weather.rainConsensus) {
      irrigationRecommendation = "Reduce irrigation – rain expected";
      waterMod = 0.5;
      insights.push(`🌧️ Rain consensus from weather sources – reduce irrigation.`);
    } else if (currentTemp > t.optimal_temp_max) {
      irrigationRecommendation = "Increase irrigation – high temperatures";
      waterMod = 1.3;
    }
  }

  const waterUsageEstimate = Math.round(baseWater * waterMod);

  // ─ Profit estimate (simplified) ─
  // Rough market price per kg used for simulation
  const pricePerKg: Record<string, number> = {
    Maize: 35, Wheat: 45, Rice: 80, Tomatoes: 75, Coffee: 400,
    Tea: 250, Beans: 90, Potatoes: 40, Sorghum: 30, Avocado: 220,
    Banana: 25, Cassava: 15, Cocoa: 800, Sugarcane: 5, Cotton: 120,
  };
  const price = pricePerKg[farm.crop_type] ?? 50;
  const profitProjection = Math.round(projectedYield * price * 0.6); // 60% margin estimate

  return {
    projectedYield,
    yieldChangePct,
    riskScore,
    pestRiskPct,
    waterUsageEstimate,
    irrigationRecommendation,
    profitProjection,
    insights,
    droughtRisk: riskLabel(clamp(droughtIdx, 0, 100)),
    floodRisk: riskLabel(clamp(floodIdx, 0, 100)),
    yieldUnit: t.yield_unit,
  };
}

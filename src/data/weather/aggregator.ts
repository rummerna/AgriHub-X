/**
 * Weather aggregator – merges multi-source readings into a single forecast
 * with hourly/daily projections, alerts, and pest markers.
 */

import type {
  AggregatedWeather,
  HourlyForecast,
  DailyForecast,
  WeatherAlert,
  PestMarker,
  WeatherSourceReading,
} from "./types";
import { getSourceReadings } from "./providers";

// ── Helpers ──────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function formatDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

// ── Forecast builders ────────────────────────────────────────────────────

const HOURS = [
  "6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM",
  "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM",
  "8 PM","9 PM","10 PM","11 PM","12 AM","1 AM","2 AM",
  "3 AM","4 AM","5 AM",
];

function buildHourly(baseTemp: number, rainConsensus: boolean, avgRain: number): HourlyForecast[] {
  return HOURS.map((hour, i) => {
    const offset = Math.sin((i - 6) * (Math.PI / 12)) * 4;
    const isNight = i < 6 || i > 18;
    const isAfternoon = i > 10 && i < 16;
    return {
      hour,
      temp: Math.round(baseTemp + offset),
      icon: isNight ? "🌙" : (rainConsensus && isAfternoon ? "🌧️" : "⛅"),
      rainChance: clamp(Math.round(avgRain + (isAfternoon ? 15 : -10)), 0, 100),
    };
  });
}

const DAY_ICONS = ["⛅", "🌧️", "⛅", "☀️", "☀️", "🌦️", "⛅"];
const DAY_DESCRIPTIONS = [
  "Partly cloudy with mild temperatures",
  "Rain expected through most of the day",
  "Clearing skies with occasional clouds",
  "Sunny and warm – great for fieldwork",
  "Clear skies continue",
  "Scattered showers possible in afternoon",
  "Mix of sun and clouds",
];

function buildDaily(baseTemp: number, avgRain: number): DailyForecast[] {
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: dayNames[d.getDay()],
      date: formatDate(d),
      high: Math.round(baseTemp + 2 + Math.random() * 3),
      low: Math.round(baseTemp - 4 - Math.random() * 2),
      icon: DAY_ICONS[i],
      rainChance: clamp(Math.round(avgRain + (i === 1 ? 25 : i === 5 ? 15 : -5 * i)), 0, 100),
      description: DAY_DESCRIPTIONS[i],
    };
  });
}

function buildAlerts(county: string, rainConsensus: boolean): WeatherAlert[] {
  if (!rainConsensus) return [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return [{
    id: "wa1",
    type: "storm",
    title: "Heavy Rain Warning",
    description: `Heavy rainfall expected in ${county} area. Secure livestock and cover exposed crops.`,
    severity: "medium",
    validUntil: `${formatDate(tomorrow)}, ${tomorrow.getFullYear()} 6:00 PM`,
  }];
}

function buildPestMarkers(): PestMarker[] {
  const relDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${formatDate(d)}, ${d.getFullYear()}`;
  };

  return [
    { id: "p1", lat: -1.52, lng: 37.26, crop: "Maize",    pest: "Fall Armyworm",        date: relDate(2), description: "Heavy infestation reported across 50+ farms. Neem-based spray recommended.", severity: "high"   },
    { id: "p2", lat: -0.09, lng: 34.77, crop: "Maize",    pest: "Fall Armyworm",        date: relDate(4), description: "Spreading from Siaya towards Kisumu. Urgent scouting advised.",              severity: "high"   },
    { id: "p3", lat: -0.72, lng: 36.97, crop: "Coffee",   pest: "Coffee Berry Disease", date: relDate(6), description: "Moderate cases in central highlands. Apply copper-based fungicide.",          severity: "medium" },
    { id: "p4", lat: -1.29, lng: 36.82, crop: "Tomatoes", pest: "Tuta Absoluta",        date: relDate(3), description: "Leaf miner damage observed in greenhouse tomatoes around Nairobi.",         severity: "medium" },
    { id: "p5", lat: -3.22, lng: 40.12, crop: "Coconut",  pest: "Rhinoceros Beetle",    date: relDate(9), description: "Low-level damage to coastal coconut palms. Monitor and trap.",              severity: "low"    },
    { id: "p6", lat:  0.35, lng: 32.58, crop: "Banana",   pest: "Banana Bacterial Wilt", date: relDate(5), description: "Outbreak in central Uganda. Remove infected plants immediately.",          severity: "high"   },
  ];
}

// ── Main aggregator ──────────────────────────────────────────────────────

export function aggregateWeather(county: string): AggregatedWeather {
  const sources = getSourceReadings(county);

  const temps = sources.map((s) => s.temperature);
  const tempAvg = avg(temps);
  const rainSources = sources.filter((s) => s.rainProbability > 40).length;
  const rainConsensus = rainSources > sources.length / 2;
  const avgRain = avg(sources.map((s) => s.rainProbability));
  const avgUv = Math.round(avg(sources.map((s) => s.uvIndex)));

  return {
    county,
    tempAvg,
    tempRange: [Math.min(...temps), Math.max(...temps)],
    feelsLike:       Math.round(avg(sources.map((s) => s.feelsLike))),
    humidity:        Math.round(avg(sources.map((s) => s.humidity))),
    windSpeed:       Math.round(avg(sources.map((s) => s.windSpeed))),
    windDirection:   sources[0].windDirection,
    pressure:        Math.round(avg(sources.map((s) => s.pressure))),
    uvIndex:         avgUv,
    uvLabel:         uvLabel(avgUv),
    condition:       sources[0].condition,
    icon:            rainConsensus ? "🌧️" : sources[0].icon,
    rainProbability: Math.round(avgRain),
    rainConsensus,
    rainLast24h:     +avg(sources.map((s) => s.rainLast24h)).toFixed(1),
    sources,
    hourly:          buildHourly(tempAvg, rainConsensus, avgRain),
    daily:           buildDaily(tempAvg, avgRain),
    alerts:          buildAlerts(county, rainConsensus),
    pestMarkers:     buildPestMarkers(),
    attribution:     "Forecast aggregated from 8 global weather providers.",
  };
}

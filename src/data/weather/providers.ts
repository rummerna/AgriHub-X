/**
 * Simulated weather provider readings (per county).
 * In production each provider would be a real API call with caching.
 */

import type { WeatherSourceReading } from "./types";

const PROVIDERS = [
  "Weather.com", "AccuWeather", "Ventusky", "Windy",
  "MeteoBlue", "Yr.no", "Weather Underground", "BBC Weather",
] as const;

/** Base readings keyed by county – the "ground truth" we jitter per provider. */
const BASE_READINGS: Record<string, Omit<WeatherSourceReading, "source">> = {
  Machakos:  { temperature: 24, feelsLike: 22, humidity: 65, windSpeed: 8,  windDirection: "SE", pressure: 1018, uvIndex: 6, condition: "Partly Cloudy", icon: "⛅", rainProbability: 10, rainLast24h: 0.2 },
  Nairobi:   { temperature: 22, feelsLike: 20, humidity: 70, windSpeed: 12, windDirection: "E",  pressure: 1015, uvIndex: 5, condition: "Overcast",      icon: "☁️", rainProbability: 45, rainLast24h: 2.1 },
  Kisumu:    { temperature: 28, feelsLike: 30, humidity: 80, windSpeed: 6,  windDirection: "W",  pressure: 1012, uvIndex: 8, condition: "Hot & Humid",    icon: "☀️", rainProbability: 30, rainLast24h: 0   },
  Mombasa:   { temperature: 30, feelsLike: 33, humidity: 78, windSpeed: 14, windDirection: "NE", pressure: 1010, uvIndex: 9, condition: "Sunny",          icon: "☀️", rainProbability: 5,  rainLast24h: 0   },
  Kampala:   { temperature: 26, feelsLike: 27, humidity: 72, windSpeed: 7,  windDirection: "S",  pressure: 1014, uvIndex: 7, condition: "Partly Cloudy",  icon: "⛅", rainProbability: 40, rainLast24h: 4.5 },
};

const DEFAULT_COUNTY = "Machakos";

/** Add random noise to a base value within ±range. */
function jitter(base: number, range: number): number {
  return +(base + (Math.random() - 0.5) * 2 * range).toFixed(1);
}

/** Clamp a number between min and max. */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Generate simulated readings from all 8 providers for a given county. */
export function getSourceReadings(county: string): WeatherSourceReading[] {
  const base = BASE_READINGS[county] ?? BASE_READINGS[DEFAULT_COUNTY];

  return PROVIDERS.map((source) => ({
    source,
    temperature:     jitter(base.temperature, 2),
    feelsLike:       jitter(base.feelsLike, 2),
    humidity:        jitter(base.humidity, 5),
    windSpeed:       jitter(base.windSpeed, 3),
    windDirection:   base.windDirection,
    pressure:        jitter(base.pressure, 4),
    uvIndex:         Math.max(0, Math.round(jitter(base.uvIndex, 1))),
    condition:       base.condition,
    icon:            base.icon,
    rainProbability: clamp(Math.round(jitter(base.rainProbability, 10)), 0, 100),
    rainLast24h:     Math.max(0, jitter(base.rainLast24h, 1)),
  }));
}

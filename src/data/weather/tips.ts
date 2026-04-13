/** Weather-based farming tips keyed by current conditions. */

import type { AggregatedWeather } from "./types";

export function getWeatherTip(weather: AggregatedWeather): string {
  if (weather.rainConsensus)
    return `🌧️ Rain expected, ${weather.tempAvg}°C – Delay fertilizer application and cover seedlings.`;
  if (weather.uvIndex >= 7)
    return `☀️ Hot & sunny, ${weather.tempAvg}°C – Irrigate early morning; harvest maize if ready.`;
  if (weather.humidity > 75)
    return `💧 High humidity, ${weather.tempAvg}°C – Watch for fungal diseases on crops.`;
  if (weather.tempAvg > 28)
    return `🌡️ Warm, ${weather.tempAvg}°C – Ensure livestock have shade and water.`;
  return `🌤️ Sunny, ${weather.tempAvg}°C – Ideal conditions for drying harvested maize.`;
}

/**
 * Barrel re-export – keeps all existing imports working.
 * New code should import from `@/data/weather/*` directly.
 */
export type {
  WeatherSourceReading,
  HourlyForecast,
  DailyForecast,
  PestMarker,
  WeatherAlert,
  AggregatedWeather,
} from "./weather/types";

export { getSourceReadings } from "./weather/providers";
export { aggregateWeather } from "./weather/aggregator";
export { getWeatherTip } from "./weather/tips";

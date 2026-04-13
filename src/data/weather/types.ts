/** Shared weather types used across the weather system. */

export interface WeatherSourceReading {
  source: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  condition: string;
  icon: string;
  rainProbability: number;
  rainLast24h: number;
}

export interface HourlyForecast {
  hour: string;
  temp: number;
  icon: string;
  rainChance: number;
}

export interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  icon: string;
  rainChance: number;
  description: string;
}

export interface PestMarker {
  id: string;
  lat: number;
  lng: number;
  crop: string;
  pest: string;
  date: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface WeatherAlert {
  id: string;
  type: "storm" | "flood" | "drought" | "heat" | "frost";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  validUntil: string;
}

export interface AggregatedWeather {
  county: string;
  tempAvg: number;
  tempRange: [number, number];
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  uvLabel: string;
  condition: string;
  icon: string;
  rainProbability: number;
  rainConsensus: boolean;
  rainLast24h: number;
  sources: WeatherSourceReading[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  pestMarkers: PestMarker[];
  attribution: string;
}

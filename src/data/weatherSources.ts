// Multi-source weather aggregation – simulated for MVP
// Each provider returns data in a normalized shape; the aggregator merges them.

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
  hour: string; // e.g. "10 AM"
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

// ====== SIMULATED PROVIDER READINGS (per county) ======
// In production each of these would be fetched from a real API and cached.

const baseReadings: Record<string, Partial<WeatherSourceReading>> = {
  Machakos: { temperature: 24, feelsLike: 22, humidity: 65, windSpeed: 8, windDirection: "SE", pressure: 1018, uvIndex: 6, condition: "Partly Cloudy", icon: "⛅", rainProbability: 10, rainLast24h: 0.2 },
  Nairobi: { temperature: 22, feelsLike: 20, humidity: 70, windSpeed: 12, windDirection: "E", pressure: 1015, uvIndex: 5, condition: "Overcast", icon: "☁️", rainProbability: 45, rainLast24h: 2.1 },
  Kisumu: { temperature: 28, feelsLike: 30, humidity: 80, windSpeed: 6, windDirection: "W", pressure: 1012, uvIndex: 8, condition: "Hot & Humid", icon: "☀️", rainProbability: 30, rainLast24h: 0 },
  Mombasa: { temperature: 30, feelsLike: 33, humidity: 78, windSpeed: 14, windDirection: "NE", pressure: 1010, uvIndex: 9, condition: "Sunny", icon: "☀️", rainProbability: 5, rainLast24h: 0 },
  Kampala: { temperature: 26, feelsLike: 27, humidity: 72, windSpeed: 7, windDirection: "S", pressure: 1014, uvIndex: 7, condition: "Partly Cloudy", icon: "⛅", rainProbability: 40, rainLast24h: 4.5 },
};

const providers = [
  "Weather.com", "AccuWeather", "Ventusky", "Windy",
  "MeteoBlue", "Yr.no", "Weather Underground", "BBC Weather",
];

function jitter(base: number, range: number) {
  return +(base + (Math.random() - 0.5) * 2 * range).toFixed(1);
}

export function getSourceReadings(county: string): WeatherSourceReading[] {
  const base = baseReadings[county] || baseReadings["Machakos"]!;
  return providers.map((source) => ({
    source,
    temperature: jitter(base.temperature!, 2),
    feelsLike: jitter(base.feelsLike!, 2),
    humidity: jitter(base.humidity!, 5),
    windSpeed: jitter(base.windSpeed!, 3),
    windDirection: base.windDirection!,
    pressure: jitter(base.pressure!, 4),
    uvIndex: Math.max(0, Math.round(jitter(base.uvIndex!, 1))),
    condition: base.condition!,
    icon: base.icon!,
    rainProbability: Math.max(0, Math.min(100, Math.round(jitter(base.rainProbability!, 10)))),
    rainLast24h: Math.max(0, jitter(base.rainLast24h!, 1)),
  }));
}

// ====== AGGREGATOR ======
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

function uvLabel(uv: number) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

const hours = ["6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM","12 AM","1 AM","2 AM","3 AM","4 AM","5 AM"];
const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const dayIcons = ["⛅","🌧️","⛅","☀️","☀️","🌦️","⛅"];
const dayDescs = [
  "Partly cloudy with mild temperatures",
  "Rain expected through most of the day",
  "Clearing skies with occasional clouds",
  "Sunny and warm – great for fieldwork",
  "Clear skies continue",
  "Scattered showers possible in afternoon",
  "Mix of sun and clouds",
];

export function aggregateWeather(county: string): AggregatedWeather {
  const sources = getSourceReadings(county);
  const temps = sources.map((s) => s.temperature);
  const tempAvg = +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
  const tempMin = Math.min(...temps);
  const tempMax = Math.max(...temps);
  const rainSources = sources.filter((s) => s.rainProbability > 40).length;
  const rainConsensus = rainSources > sources.length / 2;

  const avg = (arr: number[]) => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

  const baseTemp = tempAvg;

  const hourly: HourlyForecast[] = hours.map((hour, i) => {
    const offset = Math.sin((i - 6) * (Math.PI / 12)) * 4;
    return {
      hour,
      temp: Math.round(baseTemp + offset),
      icon: i < 6 || i > 18 ? "🌙" : (rainConsensus && i > 10 && i < 16 ? "🌧️" : "⛅"),
      rainChance: Math.max(0, Math.min(100, Math.round(avg(sources.map(s => s.rainProbability)) + (i > 10 && i < 16 ? 15 : -10)))),
    };
  });

  const daily: DailyForecast[] = dayNames.map((day, i) => ({
    day,
    date: `Feb ${25 + i}`,
    high: Math.round(baseTemp + 2 + Math.random() * 3),
    low: Math.round(baseTemp - 4 - Math.random() * 2),
    icon: dayIcons[i],
    rainChance: Math.max(0, Math.min(100, Math.round(avg(sources.map(s => s.rainProbability)) + (i === 1 ? 25 : i === 5 ? 15 : -5 * i)))),
    description: dayDescs[i],
  }));

  const alerts: WeatherAlert[] = [];
  if (rainConsensus) {
    alerts.push({
      id: "wa1",
      type: "storm",
      title: "Heavy Rain Warning",
      description: `Heavy rainfall expected in ${county} area. Secure livestock and cover exposed crops.`,
      severity: "medium",
      validUntil: "Feb 26, 2026 6:00 PM",
    });
  }

  // Sample pest markers near major East African locations
  const pestMarkers: PestMarker[] = [
    { id: "p1", lat: -1.52, lng: 37.26, crop: "Maize", pest: "Fall Armyworm", date: "Feb 22, 2026", description: "Heavy infestation reported across 50+ farms. Neem-based spray recommended.", severity: "high" },
    { id: "p2", lat: -0.09, lng: 34.77, crop: "Maize", pest: "Fall Armyworm", date: "Feb 20, 2026", description: "Spreading from Siaya towards Kisumu. Urgent scouting advised.", severity: "high" },
    { id: "p3", lat: -0.72, lng: 36.97, crop: "Coffee", pest: "Coffee Berry Disease", date: "Feb 18, 2026", description: "Moderate cases in central highlands. Apply copper-based fungicide.", severity: "medium" },
    { id: "p4", lat: -1.29, lng: 36.82, crop: "Tomatoes", pest: "Tuta Absoluta", date: "Feb 21, 2026", description: "Leaf miner damage observed in greenhouse tomatoes around Nairobi.", severity: "medium" },
    { id: "p5", lat: -3.22, lng: 40.12, crop: "Coconut", pest: "Rhinoceros Beetle", date: "Feb 15, 2026", description: "Low-level damage to coastal coconut palms. Monitor and trap.", severity: "low" },
    { id: "p6", lat: 0.35, lng: 32.58, crop: "Banana", pest: "Banana Bacterial Wilt", date: "Feb 19, 2026", description: "Outbreak in central Uganda. Remove infected plants immediately.", severity: "high" },
  ];

  const avgUv = Math.round(avg(sources.map(s => s.uvIndex)));

  return {
    county,
    tempAvg,
    tempRange: [tempMin, tempMax],
    feelsLike: Math.round(avg(sources.map(s => s.feelsLike))),
    humidity: Math.round(avg(sources.map(s => s.humidity))),
    windSpeed: Math.round(avg(sources.map(s => s.windSpeed))),
    windDirection: sources[0].windDirection,
    pressure: Math.round(avg(sources.map(s => s.pressure))),
    uvIndex: avgUv,
    uvLabel: uvLabel(avgUv),
    condition: sources[0].condition,
    icon: rainConsensus ? "🌧️" : sources[0].icon,
    rainProbability: Math.round(avg(sources.map(s => s.rainProbability))),
    rainConsensus,
    rainLast24h: +avg(sources.map(s => s.rainLast24h)).toFixed(1),
    sources,
    hourly,
    daily,
    alerts,
    pestMarkers,
    attribution: "Forecast aggregated from 8 global weather providers.",
  };
}

// Weather-based farming tips keyed by condition type
export function getWeatherTip(weather: AggregatedWeather): string {
  if (weather.rainConsensus) return `🌧️ Rain expected, ${weather.tempAvg}°C – Delay fertilizer application and cover seedlings.`;
  if (weather.uvIndex >= 7) return `☀️ Hot & sunny, ${weather.tempAvg}°C – Irrigate early morning; harvest maize if ready.`;
  if (weather.humidity > 75) return `💧 High humidity, ${weather.tempAvg}°C – Watch for fungal diseases on crops.`;
  if (weather.tempAvg > 28) return `🌡️ Warm, ${weather.tempAvg}°C – Ensure livestock have shade and water.`;
  return `🌤️ Sunny, ${weather.tempAvg}°C – Ideal conditions for drying harvested maize.`;
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CloudRain, Droplets, Wind, Gauge, Sun, Thermometer, AlertTriangle, Bug, MapPin, Shield, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { countries } from "@/data/mock";
import { aggregateWeather, getWeatherTip } from "@/data/weatherSources";
import type { AggregatedWeather, PestMarker } from "@/data/weatherSources";
import WeatherMap from "@/components/weather/WeatherMap";

const severityColor: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

const alertTypeIcon: Record<string, string> = {
  storm: "⛈️", flood: "🌊", drought: "🏜️", heat: "🔥", frost: "❄️",
};

const Weather = () => {
  const { user } = useAuth();
  const defaultCounty = user?.county || "Machakos";
  const [county, setCounty] = useState(defaultCounty);

  const weather: AggregatedWeather = useMemo(() => aggregateWeather(county), [county]);
  const tip = useMemo(() => getWeatherTip(weather), [weather]);

  const allCounties = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => c.counties.forEach((co) => set.add(co)));
    return Array.from(set).sort();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Weather & Climate in {county}</h1>
          <p className="text-sm text-muted-foreground">As of {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <Select value={county} onValueChange={setCounty}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Change location" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {allCounties.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Weather Alerts */}
      {weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm">{alertTypeIcon[alert.type]}</span>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <Badge className={`text-[10px] ${severityColor[alert.severity]}`}>{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Valid until {alert.validUntil}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farm Tip */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
        <p className="text-sm font-medium">{tip}</p>
      </div>

      {/* Current Conditions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-6xl mb-2">{weather.icon}</p>
            <p className="text-4xl font-display font-bold">{weather.tempAvg}°C</p>
            {(weather.tempRange[1] - weather.tempRange[0]) > 2 && (
              <p className="text-xs text-muted-foreground">Range: {weather.tempRange[0]}–{weather.tempRange[1]}°C</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Feels like {weather.feelsLike}°C</p>
            <p className="text-sm font-medium mt-1">{weather.condition}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat icon={<Droplets className="w-4 h-4 text-primary" />} label="Humidity" value={`${weather.humidity}%`} />
              <Stat icon={<Wind className="w-4 h-4 text-primary" />} label="Wind" value={`${weather.windSpeed} km/h ${weather.windDirection}`} />
              <Stat icon={<Gauge className="w-4 h-4 text-primary" />} label="Pressure" value={`${weather.pressure} hPa`} />
              <Stat icon={<CloudRain className="w-4 h-4 text-primary" />} label="Rain Prob." value={`${weather.rainProbability}%`} />
              <Stat icon={<Droplets className="w-4 h-4 text-primary" />} label="Rain (24h)" value={`${weather.rainLast24h} mm`} />
              <Stat icon={<Sun className="w-4 h-4 text-accent" />} label="UV Index" value={`${weather.uvIndex} – ${weather.uvLabel}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Forecast */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
              {weather.hourly.map((h) => (
                <div key={h.hour} className="flex flex-col items-center min-w-[60px] text-center gap-1">
                  <p className="text-xs text-muted-foreground">{h.hour}</p>
                  <p className="text-xl">{h.icon}</p>
                  <p className="text-sm font-semibold">{h.temp}°</p>
                  <p className="text-[10px] text-primary">{h.rainChance}%</p>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {weather.daily.map((d) => (
              <div key={d.day} className="flex items-center py-3 gap-3">
                <p className="w-10 text-sm font-semibold">{d.day}</p>
                <p className="text-xl w-8">{d.icon}</p>
                <div className="flex-1">
                  <p className="text-sm">{d.description}</p>
                  <p className="text-xs text-muted-foreground">{d.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{d.high}° / {d.low}°</p>
                  <p className="text-xs text-primary flex items-center gap-0.5 justify-end">
                    <CloudRain className="w-3 h-3" /> {d.rainChance}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Map & Pest/Disease */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="pest">Pest & Disease Outbreaks</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card className="shadow-md overflow-hidden">
            <CardContent className="p-0">
              <WeatherMap pestMarkers={weather.pestMarkers} county={county} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pest">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="w-5 h-5 text-destructive" /> Pest & Disease Outbreaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weather.pestMarkers.map((p) => (
                <PestCard key={p.id} marker={p} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Provider Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4">Source</th>
                      <th className="py-2 pr-4">Temp</th>
                      <th className="py-2 pr-4">Rain %</th>
                      <th className="py-2 pr-4">Humidity</th>
                      <th className="py-2">Wind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weather.sources.map((s) => (
                      <tr key={s.source} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-medium">{s.source}</td>
                        <td className="py-2 pr-4">{s.temperature}°C</td>
                        <td className="py-2 pr-4">{s.rainProbability}%</td>
                        <td className="py-2 pr-4">{s.humidity}%</td>
                        <td className="py-2">{s.windSpeed} km/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attribution */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" /> {weather.attribution} No GPS tracking – location from your profile.
      </p>
    </div>
  );
};

// Sub-components
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function PestCard({ marker }: { marker: PestMarker }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
      <Bug className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold">{marker.pest}</p>
          <Badge className={`text-[10px] ${severityColor[marker.severity]}`}>{marker.severity}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{marker.description}</p>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {marker.crop}</span>
          <span>{marker.date}</span>
        </div>
      </div>
    </div>
  );
}

export default Weather;

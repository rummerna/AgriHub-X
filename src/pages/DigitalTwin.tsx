import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Sprout, Droplets, Thermometer, Bug, TrendingUp, TrendingDown, Gauge, Leaf, Plus,
  ShieldCheck, BarChart3, CloudRain, Wheat, AlertTriangle, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useDigitalTwin, type Farm } from "@/hooks/useDigitalTwin";
import { countries } from "@/data/mock";

const soilTypes = ["Loam", "Clay", "Sandy", "Silt", "Clay Loam", "Sandy Loam", "Peat"];
const irrigationTypes = ["Rainfed", "Drip", "Sprinkler", "Flood", "Center Pivot"];

const riskColor: Record<string, string> = {
  Low: "bg-primary/15 text-primary",
  Medium: "bg-accent/15 text-accent-foreground",
  High: "bg-destructive/15 text-destructive",
};

const DigitalTwin = () => {
  const {
    farms, selectedFarm, selectedFarmId, setSelectedFarmId,
    simulation, weather, loading, isLoggedIn, addFarm, cropThresholds, demoFarm,
  } = useDigitalTwin();

  const [addOpen, setAddOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "", region: "Machakos", country: "Kenya", farm_size: 5,
    farm_size_unit: "acres", crop_type: "Maize", soil_type: "Loam",
    irrigation_type: "Rainfed", planting_date: null as string | null,
  });

  const activeFarm = selectedFarm ?? {
    ...demoFarm, id: "demo", user_id: "", farm_size_unit: "acres", planting_date: null
  };

  const handleAddFarm = async () => {
    await addFarm(newFarm);
    setAddOpen(false);
    setNewFarm({ name: "", region: "Machakos", country: "Kenya", farm_size: 5, farm_size_unit: "acres", crop_type: "Maize", soil_type: "Loam", irrigation_type: "Rainfed", planting_date: null });
  };

  const allCounties = countries.flatMap((c) => c.counties.map((co) => ({ county: co, country: c.name }))).sort((a, b) => a.county.localeCompare(b.county));
  const cropNames = cropThresholds.map((c) => c.crop_name).sort();

  // Chart data from weather hourly
  const hourlyData = weather?.hourly.map((h) => ({ time: h.hour, temp: h.temp, rain: h.rainChance })) ?? [];
  const dailyData = weather?.daily.map((d) => ({ day: d.day, high: d.high, low: d.low, rain: d.rainChance })) ?? [];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Sprout className="w-8 h-8 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <Sprout className="w-7 h-7 text-primary" /> Digital Twin Farm
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered simulation for {activeFarm.crop_type} in {activeFarm.region}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && farms.length > 0 && (
            <Select value={selectedFarmId ?? ""} onValueChange={setSelectedFarmId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select farm" /></SelectTrigger>
              <SelectContent>
                {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name || `${f.crop_type} – ${f.region}`}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {isLoggedIn && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Farm</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Register a Farm</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Farm Name</Label><Input value={newFarm.name} onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })} placeholder="e.g. Kamau's Maize Plot" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Country</Label>
                      <Select value={newFarm.country} onValueChange={(v) => setNewFarm({ ...newFarm, country: v, region: countries.find((c) => c.name === v)?.counties[0] ?? "" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-48">{countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Region / County</Label>
                      <Select value={newFarm.region} onValueChange={(v) => setNewFarm({ ...newFarm, region: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-48">{(countries.find((c) => c.name === newFarm.country)?.counties ?? []).map((co) => <SelectItem key={co} value={co}>{co}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Farm Size</Label><Input type="number" min={0.1} value={newFarm.farm_size} onChange={(e) => setNewFarm({ ...newFarm, farm_size: +e.target.value })} /></div>
                    <div>
                      <Label>Crop</Label>
                      <Select value={newFarm.crop_type} onValueChange={(v) => setNewFarm({ ...newFarm, crop_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{cropNames.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Soil Type</Label>
                      <Select value={newFarm.soil_type} onValueChange={(v) => setNewFarm({ ...newFarm, soil_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{soilTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Irrigation</Label>
                      <Select value={newFarm.irrigation_type} onValueChange={(v) => setNewFarm({ ...newFarm, irrigation_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{irrigationTypes.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddFarm} className="w-full">Create Farm</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!isLoggedIn && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <ShieldCheck className="w-4 h-4 inline mr-1 text-primary" />
          Viewing demo simulation. <a href="/auth/signup" className="underline font-medium text-primary">Sign up</a> to register your farm and get personalized projections.
        </div>
      )}

      {simulation && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={<Wheat className="w-5 h-5 text-primary" />}
              label="Projected Yield"
              value={`${simulation.projectedYield.toLocaleString()} ${simulation.yieldUnit}`}
              badge={
                <Badge className={simulation.yieldChangePct >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}>
                  {simulation.yieldChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {simulation.yieldChangePct}%
                </Badge>
              }
            />
            <KPICard
              icon={<Gauge className="w-5 h-5 text-accent" />}
              label="Risk Score"
              value={`${simulation.riskScore}/100`}
              badge={<Badge className={riskColor[simulation.riskScore < 30 ? "Low" : simulation.riskScore < 60 ? "Medium" : "High"]}>{simulation.riskScore < 30 ? "Low" : simulation.riskScore < 60 ? "Medium" : "High"}</Badge>}
            />
            <KPICard
              icon={<Bug className="w-5 h-5 text-destructive" />}
              label="Pest Risk"
              value={`${simulation.pestRiskPct}%`}
              badge={<Badge className={riskColor[simulation.pestRiskPct < 30 ? "Low" : simulation.pestRiskPct < 60 ? "Medium" : "High"]}>{simulation.pestRiskPct < 30 ? "Low" : simulation.pestRiskPct < 60 ? "Medium" : "High"}</Badge>}
            />
            <KPICard
              icon={<Droplets className="w-5 h-5 text-primary" />}
              label="Water Usage"
              value={`${simulation.waterUsageEstimate.toLocaleString()} L`}
              badge={<Badge variant="outline" className="text-xs">{simulation.irrigationRecommendation}</Badge>}
            />
          </div>

          {/* Risk bars */}
          <div className="grid md:grid-cols-3 gap-4">
            <RiskBar label="Drought Risk" level={simulation.droughtRisk} />
            <RiskBar label="Flood Risk" level={simulation.floodRisk} />
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Estimated Profit</p>
                <p className="text-xl font-display font-bold text-primary">KES {simulation.profitProjection.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Based on current market estimates</p>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          {simulation.insights.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-accent" /> AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {simulation.insights.map((insight, i) => (
                  <div key={i} className="text-sm p-2 rounded-md bg-muted/50">{insight}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Thermometer className="w-4 h-4 text-destructive" /> Temperature Trend (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Temp °C" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><CloudRain className="w-4 h-4 text-primary" /> Rainfall Probability (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="rain" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} name="Rain %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weather + Yield prediction */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" /> 7-Day Yield Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyData.map((d, i) => ({
                    ...d,
                    yield: Math.round(simulation.projectedYield / 7 * (1 + (d.rain > 50 ? -0.1 : 0.02) * (i + 1))),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="yield" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name={`Yield (${simulation.yieldUnit})`} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {weather && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Conditions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <MiniStat label="Temperature" value={`${weather.tempAvg}°C`} icon={<Thermometer className="w-3.5 h-3.5" />} />
                  <MiniStat label="Humidity" value={`${weather.humidity}%`} icon={<Droplets className="w-3.5 h-3.5" />} />
                  <MiniStat label="Rain Prob." value={`${weather.rainProbability}%`} icon={<CloudRain className="w-3.5 h-3.5" />} />
                  <MiniStat label="UV Index" value={`${weather.uvIndex}`} icon={<Leaf className="w-3.5 h-3.5" />} />
                  <MiniStat label="Wind" value={`${weather.windSpeed} km/h`} icon={<Gauge className="w-3.5 h-3.5" />} />
                  <MiniStat label="Condition" value={weather.condition} icon={<span className="text-sm">{weather.icon}</span>} />
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Privacy footer */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Region-based modeling only. No GPS tracking. Data from 8 global weather providers.
      </p>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────

function KPICard({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {icon}
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-display font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function RiskBar({ label, level }: { label: string; level: "Low" | "Medium" | "High" }) {
  const val = level === "Low" ? 25 : level === "Medium" ? 55 : 85;
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Badge className={riskColor[level]}>{level}</Badge>
        </div>
        <Progress value={val} className="h-2" />
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default DigitalTwin;

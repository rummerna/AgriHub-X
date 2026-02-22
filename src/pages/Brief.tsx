import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, TrendingUp, TrendingDown, Bug, Lightbulb, Users, AlertTriangle } from "lucide-react";
import { dailyBriefData, weatherData } from "@/data/mock";

const severityColors = { high: "bg-destructive text-destructive-foreground", medium: "bg-accent text-accent-foreground", low: "bg-muted text-muted-foreground" };

const Brief = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">🌤️ Daily Farm Brief</h1>
      <p className="text-muted-foreground text-sm mb-6">Your personalized farming insights for today</p>

      <div className="grid gap-4">
        {/* Weather */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><CloudRain className="w-5 h-5 text-primary" />Weather Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{dailyBriefData.weather.summary}</p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">⚠️ Advisory: {dailyBriefData.weather.advisory}</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weatherData.forecast.map((d) => (
                <div key={d.day} className="space-y-1">
                  <p className="font-medium text-muted-foreground">{d.day}</p>
                  <p className="text-lg">{d.icon}</p>
                  <p className="font-medium">{d.temp}°</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Market Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {dailyBriefData.marketPrices.map((item) => (
                <div key={item.crop} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium">{item.crop}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.price}</span>
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${item.direction === "up" ? "text-primary" : "text-destructive"}`}>
                      {item.direction === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-accent" />Farming Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyBriefData.tips.map((tip) => (
              <div key={tip.title} className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-semibold mb-1">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pest & Disease Alerts */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Bug className="w-5 h-5 text-destructive" />Alerts & Outbreaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyBriefData.alerts.map((alert) => (
              <div key={alert.title} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <Badge className={`text-[10px] ${severityColors[alert.severity]}`}>{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Highlights */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Community Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyBriefData.communityHighlights.map((item) => (
              <div key={item.author} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {item.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.preview}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.engagement}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Brief;

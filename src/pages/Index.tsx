import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, HelpCircle, Wrench, CloudRain, TrendingUp, Bug, Lightbulb, Shield } from "lucide-react";
import { weatherData } from "@/data/mock";

const quickActions = [
  { to: "/marketplace", label: "Marketplace", desc: "Browse crops, livestock, fertilizers, and equipment", icon: ShoppingCart, color: "bg-primary" },
  { to: "/community", label: "Agri Community", desc: "Connect with farmers in your county", icon: Users, color: "bg-secondary" },
  { to: "/ask-agri", label: "Ask Agri", desc: "Ask questions and get expert answers", icon: HelpCircle, color: "bg-accent" },
  { to: "/services", label: "Agri Services", desc: "Find vets, transport, equipment rentals", icon: Wrench, color: "bg-primary" },
];

const Index = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
          Connect. Trade. Grow. <span className="text-primary">Smarter.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Buy, sell, learn, and access daily farm insights — no tracking, just trust.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth/signup"><Button size="lg" className="font-semibold">Join Free</Button></Link>
          <Link to="/marketplace"><Button size="lg" variant="outline" className="font-semibold">Explore Marketplace</Button></Link>
        </div>
      </section>

      {/* Daily Farm Brief + Weather */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">🌤️ Daily Farm Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><CloudRain className="w-4 h-4 text-primary" /> <span>Weather: Light rain expected tomorrow</span></div>
            <div className="flex items-center gap-2 text-sm"><Lightbulb className="w-4 h-4 text-accent" /> <span>Tip: Delay fertilizer application today</span></div>
            <div className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-secondary" /> <span>Price: Maize ↑ 5% this week</span></div>
            <div className="flex items-center gap-2 text-sm"><Bug className="w-4 h-4 text-destructive" /> <span>Alert: Pest outbreak reported nearby</span></div>
            <Button variant="outline" size="sm" className="w-full mt-2">View Full Brief</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Weather in {weatherData.county}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-4xl font-bold font-display">{weatherData.temperature}°C</p>
                <p className="text-sm text-muted-foreground">{weatherData.condition}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rain probability</p>
                <p className="text-2xl font-bold text-primary">{weatherData.rainProbability}%</p>
              </div>
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
      </div>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map(({ to, label, desc, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center space-y-2">
                <div className={`w-12 h-12 mx-auto rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{label}</h3>
                <p className="text-xs text-muted-foreground hidden md:block">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Privacy Footer */}
      <footer className="text-center py-6 border-t border-border">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
          <Shield className="w-4 h-4" />
          Your privacy matters. AgriHubX does not track your GPS location.
        </p>
      </footer>
    </div>
  );
};

export default Index;

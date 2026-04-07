import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Users, HelpCircle, Wrench, CloudRain, TrendingUp, Bug,
  Lightbulb, Shield, Droplets, Wind, Gavel, Package, MessageCircle, ArrowRight,
  Star, Loader2, CheckCircle, Sprout
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSeason } from "@/hooks/useSeason";
import { aggregateWeather, getWeatherTip } from "@/data/weatherSources";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { to: "/marketplace", label: "Sell Now", icon: ShoppingCart, color: "bg-primary" },
  { to: "/ask-agri", label: "Ask Agri", icon: HelpCircle, color: "bg-secondary" },
  { to: "/community", label: "Post", icon: MessageCircle, color: "bg-accent" },
  { to: "/auctions", label: "Auctions", icon: Gavel, color: "bg-primary" },
  { to: "/services", label: "Services", icon: Wrench, color: "bg-secondary" },
];

const features = [
  { icon: ShoppingCart, title: "Trade Directly", desc: "Buy and sell crops, livestock, equipment — peer to peer, no middlemen." },
  { icon: Sprout, title: "Farm Twin AI", desc: "Simulate weather, yields, and risks for your specific farm." },
  { icon: HelpCircle, title: "Expert Answers", desc: "Ask questions and get AI + community answers instantly." },
  { icon: Shield, title: "Trusted Platform", desc: "Verified sellers, credit scores, and real reviews from real farmers." },
];

const Index = () => {
  const { isLoggedIn, user, supabaseUser } = useAuth();
  const season = useSeason(user?.country);
  const weatherCounty = user?.weatherLocationCounty || user?.county || "Machakos";
  const weather = aggregateWeather(weatherCounty);
  const weatherTip = getWeatherTip(weather);

  const [myListings, setMyListings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!supabaseUser) return;
    setStatsLoading(true);
    Promise.all([
      supabase.from("products").select("id, title, price, currency, category").eq("user_id", supabaseUser.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("id, total_amount, status, created_at").eq("user_id", supabaseUser.id).order("created_at", { ascending: false }).limit(3),
    ]).then(([{ data: prods }, { data: ords }]) => {
      setMyListings(prods || []);
      setRecentOrders(ords || []);
      setStatsLoading(false);
    });
  }, [supabaseUser]);

  if (isLoggedIn) {
    // Authenticated Dashboard
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Welcome back, <span className="text-primary">{user?.name?.split(" ")[0] || "Farmer"}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm">Here's your farm overview for today.</p>
        </div>

        {/* Daily Brief + Weather */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">🌾 Daily Farm Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm"><CloudRain className="w-4 h-4 text-primary shrink-0" /><span>{weatherTip}</span></div>
              <div className="flex items-center gap-2 text-sm"><Lightbulb className="w-4 h-4 text-accent shrink-0" /><span>Tip: Delay fertilizer application today.</span></div>
              <div className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-secondary shrink-0" /><span>Maize ↑5% this week. Tomatoes stable.</span></div>
              <div className="flex items-center gap-2 text-sm"><Bug className="w-4 h-4 text-destructive shrink-0" /><span>Pest outbreak reported nearby.</span></div>
              <Link to="/brief"><Button variant="outline" size="sm" className="w-full mt-1">View Full Brief →</Button></Link>
            </CardContent>
          </Card>

          <Link to="/weather" className="block">
            <Card className="shadow-[var(--shadow-card)] h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weather in {weather.county}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{weather.icon}</span>
                    <div>
                      <p className="text-3xl font-bold font-display">{weather.tempAvg}°C</p>
                      <p className="text-xs text-muted-foreground">Feels like {weather.feelsLike}°C</p>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><CloudRain className="w-3 h-3" /> Rain: {weather.rainProbability}%</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Droplets className="w-3 h-3" /> Humidity: {weather.humidity}%</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Wind className="w-3 h-3" /> {weather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs border-t border-border pt-2">
                  {weather.daily.slice(0, 7).map((d) => (
                    <div key={d.day} className="space-y-0.5">
                      <p className="font-medium text-muted-foreground">{d.day}</p>
                      <p className="text-base">{d.icon}</p>
                      <p className="text-[11px] font-medium">{d.high}°/{d.low}°</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickActions.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                {label}
              </Button>
            </Link>
          ))}
        </div>

        {/* My Listings + Recent Orders */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">My Active Listings</h3>
                <Link to="/marketplace"><Button variant="ghost" size="sm" className="text-xs gap-1">View All <ArrowRight className="w-3 h-3" /></Button></Link>
              </div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
              ) : myListings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No listings yet. <Link to="/marketplace" className="text-primary underline">List a product</Link></p>
              ) : (
                <div className="space-y-2">
                  {myListings.map(l => (
                    <div key={l.id} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.category}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{l.currency || "KES"} {Number(l.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Recent Orders</h3>
                <Link to="/orders"><Button variant="ghost" size="sm" className="text-xs gap-1">View All <ArrowRight className="w-3 h-3" /></Button></Link>
              </div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map(o => (
                    <div key={o.id} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">KES {Number(o.total_amount).toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{o.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Unauthenticated Landing Page
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Connect. Trade. Grow. <span className="text-primary">Smarter.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Buy, sell, learn, and access daily farm insights — no tracking, just trust.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth/signup"><Button size="lg" className="font-semibold text-base px-8">Join Free</Button></Link>
          <Link to="/marketplace"><Button size="lg" variant="outline" className="font-semibold text-base px-8">Explore Marketplace</Button></Link>
        </div>
      </section>

      {/* Daily Brief + Weather (public preview) */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">🌾 Daily Farm Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm"><CloudRain className="w-4 h-4 text-primary" /><span>{weatherTip}</span></div>
            <div className="flex items-center gap-2 text-sm"><Lightbulb className="w-4 h-4 text-accent" /><span>Tip: Delay fertilizer application today.</span></div>
            <div className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-secondary" /><span>Maize ↑5% this week. Tomatoes stable.</span></div>
            <div className="flex items-center gap-2 text-sm"><Bug className="w-4 h-4 text-destructive" /><span>Pest outbreak reported nearby.</span></div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weather in {weather.county}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{weather.icon}</span>
              <div>
                <p className="text-3xl font-bold font-display">{weather.tempAvg}°C</p>
                <p className="text-xs text-muted-foreground">Feels like {weather.feelsLike}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs border-t border-border pt-2">
              {weather.daily.slice(0, 7).map((d) => (
                <div key={d.day} className="space-y-0.5">
                  <p className="font-medium text-muted-foreground">{d.day}</p>
                  <p className="text-base">{d.icon}</p>
                  <p className="text-[11px] font-medium">{d.high}°/{d.low}°</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-center mb-8">Why Farmers Choose AgriHubX</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12 text-center">
        <h2 className="text-2xl font-display font-bold mb-8">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Sign Up Free", desc: "Create your profile and tell us what you grow or need." },
            { step: "2", title: "List or Browse", desc: "Post your produce or browse listings from verified farmers." },
            { step: "3", title: "Trade & Grow", desc: "Message sellers, pay securely, and grow your farm business." },
          ].map(s => (
            <div key={s.step} className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto">{s.step}</div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-display font-bold mb-3">Ready to grow smarter?</h2>
        <p className="text-muted-foreground mb-6">Join thousands of farmers already trading on AgriHubX.</p>
        <Link to="/auth/signup"><Button size="lg" className="font-semibold px-8">Get Started — It's Free</Button></Link>
        <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5" /> No GPS tracking. Your privacy matters.
        </p>
      </section>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageCircle, Plus, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const serviceCategories = [
  "All", "Soil Testing", "Crop Spraying", "Transport", "Storage",
  "Consulting", "Veterinary", "Labour", "Equipment Rental", "Other"
];

interface ServiceRow {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  category: string;
  price: number | null;
  price_type: string;
  currency: string;
  location: string | null;
  rating_avg: number;
  rating_count: number;
  provider_name?: string;
  provider_verified?: boolean;
}

const Services = () => {
  const { isLoggedIn } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const providerIds = [...new Set(data.map(s => s.provider_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, verified")
          .in("user_id", providerIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        setServices(data.map(s => {
          const profile = profileMap.get(s.provider_id);
          return {
            ...s,
            provider_name: profile?.full_name || "Provider",
            provider_verified: profile?.verified || false,
          };
        }));
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  const filtered = services.filter(s => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const priceLabel = (s: ServiceRow) => {
    if (s.price_type === "free" || !s.price) return "Free";
    const suffix = s.price_type === "hourly" ? "/hr" : s.price_type === "negotiable" ? " (neg)" : "";
    return `${s.currency} ${Number(s.price).toLocaleString()}${suffix}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Agri Services</h1>
        {isLoggedIn && (
          <Link to="/services/new">
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> List Service</Button>
          </Link>
        )}
      </div>
      <p className="text-muted-foreground mb-4 text-sm">Find veterinary, transport, equipment, and more</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {serviceCategories.map((cat) => (
          <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-3">No services found</p>
          {isLoggedIn && <Link to="/services/new"><Button variant="outline">Be the first to list a service</Button></Link>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link key={s.id} to={`/services/${s.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{s.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">{s.category}</Badge>
                  </div>
                  {s.description && <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                  <p className="text-sm font-bold text-primary">{priceLabel(s)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {s.provider_name}
                      {s.provider_verified && <span className="text-primary">✓</span>}
                    </span>
                    {s.rating_count > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        {Number(s.rating_avg).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {s.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;

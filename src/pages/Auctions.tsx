import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Gavel, Plus, Clock, MapPin, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CreateAuctionDialog from "@/components/auction/CreateAuctionDialog";
import AuctionCountdown from "@/components/auction/AuctionCountdown";

const categories = ["All", "Crops", "Livestock", "Inputs", "Equipment"];
const sortOptions = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "newly_listed", label: "Newly Listed" },
  { value: "most_bids", label: "Most Bids" },
  { value: "lowest_price", label: "Lowest Price" },
  { value: "highest_price", label: "Highest Price" },
];

interface Auction {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  starting_bid: number;
  current_bid: number | null;
  reserve_price: number | null;
  bids_count: number;
  start_time: string;
  end_time: string;
  status: string;
  image_url: string | null;
  country: string;
  county: string;
  currency: string;
  seller_id: string;
  seller_name?: string;
  description?: string;
}

const Auctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("ending_soon");
  const [showCreate, setShowCreate] = useState(false);
  const { isLoggedIn } = useAuth();

  const fetchAuctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .eq("status", "active")
      .order("end_time", { ascending: true });

    if (data && !error) {
      const userIds = [...new Set(data.map((a: any) => a.seller_id))];
      const { data: profiles } = await supabase
        .from("profiles_public" as any as 'profiles')
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name]) || []);

      setAuctions(
        data.map((a: any) => ({
          ...a,
          seller_name: nameMap.get(a.seller_id) || "Unknown",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuctions();

    // Realtime subscription
    const channel = supabase
      .channel("auctions-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, () => {
        fetchAuctions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = auctions
    .filter((a) => {
      const matchCat = activeCategory === "All" || a.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        a.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.seller_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "ending_soon": return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        case "newly_listed": return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case "most_bids": return b.bids_count - a.bids_count;
        case "lowest_price": return (a.current_bid || a.starting_bid) - (b.current_bid || b.starting_bid);
        case "highest_price": return (b.current_bid || b.starting_bid) - (a.current_bid || a.starting_bid);
        default: return 0;
      }
    });

  const getTimeColor = (endTime: string) => {
    const ms = new Date(endTime).getTime() - Date.now();
    if (ms < 3600000) return "text-destructive";
    if (ms < 21600000) return "text-accent";
    return "text-primary";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Gavel className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold">Live Auctions</h1>
        </div>
        {isLoggedIn && (
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Create Auction
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mb-4 text-sm">Bid on crops, livestock, inputs, and equipment in real time</p>

      {/* Search & Sort */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search auctions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Gavel className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No live auctions yet</p>
          <p className="text-sm">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Link key={a.id} to={`/auctions/${a.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-[16/9] bg-muted flex items-center justify-center relative">
                  <img
                    src={a.image_url || "/placeholder.svg"}
                    alt={a.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                  <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground gap-1">
                    <Eye className="w-3 h-3" />
                    {a.bids_count} bids
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {a.product_name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-primary text-lg">
                      {a.currency} {(a.current_bid || a.starting_bid).toLocaleString()}
                    </span>
                    {!a.current_bid && (
                      <span className="text-xs text-muted-foreground">Starting bid</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${getTimeColor(a.end_time)}`}>
                    <Clock className="w-3 h-3" />
                    <AuctionCountdown endTime={a.end_time} compact />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{a.seller_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.county}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateAuctionDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchAuctions} />
    </div>
  );
};

export default Auctions;

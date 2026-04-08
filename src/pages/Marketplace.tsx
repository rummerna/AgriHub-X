import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bookmark, BookmarkCheck, MapPin, Search, Loader2, Gavel, ShoppingCart } from "lucide-react";
import { paymentMethods } from "@/data/mock";
import ListProductDialog from "@/components/ListProductDialog";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCurrency } from "@/hooks/useCurrency";

const mainCategories = ["All", "Crops", "Livestock", "Inputs", "Equipment"];

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  seller: string;
  country: string;
  county: string;
  category: string;
  sellerId?: string;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, itemCount } = useCart();
  const { savedIds, toggleSave } = useSavedItems();
  const { formatPrice } = useCurrency();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      setProducts(data.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        currency: p.currency || "KES",
        image: p.image_url || "/placeholder.svg",
        seller: nameMap.get(p.user_id) || "Unknown",
        country: p.country || "",
        county: p.county || "",
        category: p.category,
        sellerId: p.user_id,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Marketplace</h1>
        <div className="flex gap-2">
          <Link to="/cart">
            <Button variant="outline" className="gap-1.5 relative">
              <ShoppingCart className="w-4 h-4" /> Cart
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
              )}
            </Button>
          </Link>
          <Link to="/saved">
            <Button variant="outline" className="gap-1.5"><Bookmark className="w-4 h-4" /> Saved</Button>
          </Link>
          <Link to="/auctions">
            <Button variant="outline" className="gap-1.5"><Gavel className="w-4 h-4" /> Live Auctions</Button>
          </Link>
          <ListProductDialog onProductListed={fetchProducts} />
        </div>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">Browse crops, livestock, inputs, and equipment</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="What do you need? Search products, sellers..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {mainCategories.map((cat) => (
          <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}>{cat}</Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try a different category or search term, or list the first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/marketplace/${p.id}`)}>
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; (e.target as HTMLImageElement).className = "w-16 h-16 opacity-40"; }} />
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                <p className="font-bold text-primary text-lg">{formatPrice(p.price, p.currency)}</p>
                <p className="text-xs text-muted-foreground">{p.seller}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.county}, {p.country}</p>
                <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => addToCart(p.id)}>
                    <ShoppingCart className="w-3 h-3" /> Add
                  </Button>
                  <Button size="sm" className="flex-1 gap-1" onClick={() => navigate(`/marketplace/${p.id}`)}><MessageCircle className="w-3 h-3" />Details</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleSave(p.id)}>
                    {savedIds.has(p.id) ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="font-display font-semibold text-lg mb-3">Accepted Payment Methods</h2>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((pm) => (
              <Badge key={pm.id} variant="secondary" className="text-sm py-2 px-4 gap-2 font-semibold">
                <span className="w-7 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{pm.icon}</span>
                {pm.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;

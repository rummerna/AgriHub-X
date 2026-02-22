import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bookmark, MapPin, Search } from "lucide-react";
import { products, marketplaceCategories, paymentMethods } from "@/data/mock";
import ListProductDialog from "@/components/ListProductDialog";
import ProductDetail from "@/components/ProductDetail";

const mainCategories = ["All", "Crops", "Livestock", "Inputs", "Equipment"];

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Marketplace</h1>
        <ListProductDialog />
      </div>
      <p className="text-muted-foreground mb-4 text-sm">Browse crops, livestock, inputs, and equipment</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="What do you need? Search products, sellers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {mainCategories.map((cat) => (
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedProduct(p)}
          >
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              <img src={p.image} alt={p.title} className="w-16 h-16 opacity-40" />
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
              <p className="font-bold text-primary text-lg">{p.currency} {p.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{p.seller}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.county}, {p.country}</p>
              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" className="flex-1 gap-1"><MessageCircle className="w-3 h-3" />Message</Button>
                <Button size="sm" variant="outline"><Bookmark className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try a different category or search term</p>
        </div>
      )}

      {/* Payment Methods */}
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

      <ProductDetail product={selectedProduct} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Marketplace;

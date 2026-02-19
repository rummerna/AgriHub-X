import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bookmark, MapPin } from "lucide-react";
import { products, marketplaceCategories, paymentMethods } from "@/data/mock";

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Marketplace</h1>
      <p className="text-muted-foreground mb-4 text-sm">Browse crops, livestock, inputs, and equipment</p>

      {/* Categories */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", ...marketplaceCategories].map((cat) => (
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
          <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              <img src={p.image} alt={p.title} className="w-16 h-16 opacity-40" />
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
              <p className="font-bold text-primary text-lg">{p.currency} {p.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{p.seller}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.county}, {p.country}</p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 gap-1"><MessageCircle className="w-3 h-3" />Message</Button>
                <Button size="sm" variant="outline"><Bookmark className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods UI */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="font-display font-semibold text-lg mb-3">Accepted Payment Methods</h2>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((pm) => (
              <Badge key={pm.id} variant="secondary" className="text-sm py-2 px-4 gap-2">
                <span className="text-lg">{pm.icon}</span> {pm.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;

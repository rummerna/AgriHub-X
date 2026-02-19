import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone } from "lucide-react";
import { services, serviceCategories } from "@/data/mock";

const Services = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All" ? services : services.filter((s) => s.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Agri Services</h1>
      <p className="text-muted-foreground mb-4 text-sm">Find veterinary, transport, equipment, and more</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", ...serviceCategories].map((cat) => (
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <Card key={s.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{s.provider}</h3>
                <Badge variant="secondary" className="text-xs">{s.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-semibold">{s.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.area}</p>
              <Button size="sm" className="w-full gap-1.5"><Phone className="w-3 h-3" /> Contact</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCart } from "@/hooks/useCart";

const SavedItems = () => {
  const { items, loading, removeSaved } = useSavedItems();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <Bookmark className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold">No Saved Items</h1>
        <p className="text-muted-foreground">Save products from the marketplace to view them here.</p>
        <Link to="/marketplace">
          <Button className="gap-1.5"><ShoppingCart className="w-4 h-4" /> Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-display font-bold">Saved Items ({items.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              <img src={item.image} alt={item.title} className="w-16 h-16 opacity-40" />
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm truncate">{item.title}</h3>
              <p className="font-bold text-primary">{item.currency} {item.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{item.seller}</p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1" onClick={() => addToCart(item.product_id)}>
                  <ShoppingCart className="w-3 h-3" /> Add to Cart
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeSaved(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedItems;

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, Bookmark, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSavedItems } from "@/hooks/useSavedItems";

const Cart = () => {
  const { items, loading, updateQuantity, removeItem, subtotal, currency, itemCount } = useCart();
  const { toggleSave } = useSavedItems();
  const deliveryFee = items.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

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
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
        <Link to="/marketplace">
          <Button className="gap-1.5"><ShoppingCart className="w-4 h-4" /> Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-display font-bold">My Cart ({itemCount} items)</h1>

      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 flex gap-4 items-center">
            <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.seller}</p>
              <p className="font-bold text-primary">{item.currency} {item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <p className="font-bold text-sm whitespace-nowrap">{item.currency} {(item.price * item.quantity).toLocaleString()}</p>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { toggleSave(item.product_id); removeItem(item.id); }}>
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="sticky bottom-20 md:bottom-4 shadow-lg border-primary/20">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{currency} {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{currency} {deliveryFee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{currency} {total.toLocaleString()}</span></div>
          <Link to="/checkout">
            <Button className="w-full gap-1.5 mt-2" size="lg">
              <ShoppingCart className="w-5 h-5" /> Proceed to Checkout ({currency} {total.toLocaleString()})
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;

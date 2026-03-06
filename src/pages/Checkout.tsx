import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingCart, MapPin, CreditCard, CheckCircle, Loader2, PartyPopper } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { id: "mpesa", label: "M-PESA", desc: "Pay via M-PESA" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard via Stripe" },
  { id: "paypal", label: "PayPal", desc: "Pay with PayPal" },
  { id: "bank", label: "Bank Transfer", desc: "Manual bank transfer" },
];

const Checkout = () => {
  const { items, subtotal, currency, clearCart } = useCart();
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [address, setAddress] = useState(
    `${user?.county || ""}${user?.county && user?.country ? ", " : ""}${user?.country || ""}`
  );
  const [placing, setPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  const deliveryFee = items.length > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!supabaseUser || items.length === 0) return;
    setPlacing(true);
    try {
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: supabaseUser.id,
        total_amount: total,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        delivery_address: address,
        status: "pending",
      }).select().single();

      if (orderErr) throw orderErr;

      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.price,
        currency: i.currency,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      // Notify sellers and reduce stock
      const productIds = items.map(i => i.product_id);
      const { data: productsData } = await supabase
        .from("products")
        .select("id, user_id, title, quantity")
        .in("id", productIds);

      if (productsData) {
        for (const prod of productsData) {
          const cartItem = items.find(i => i.product_id === prod.id);
          const newQty = Math.max(0, (prod.quantity || 1) - (cartItem?.quantity || 1));

          // Reduce product quantity
          await supabase.from("products").update({ quantity: newQty }).eq("id", prod.id);

          // Notify seller
          if (prod.user_id !== supabaseUser.id) {
            await supabase.from("notifications").insert({
              user_id: prod.user_id,
              type: "new_order",
              reference_id: order.id,
              message: `New order for "${prod.title}" (×${cartItem?.quantity || 1})`,
            });
          }
        }
      }

      await clearCart();
      setOrderId(order.id.slice(0, 8).toUpperCase());
      setOrderComplete(true);
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    }
    setPlacing(false);
  };

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <PartyPopper className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-2xl font-display font-bold text-primary">Order Placed!</h1>
        <p className="text-muted-foreground">Order #{orderId}</p>
        <p className="text-sm text-muted-foreground">You'll receive a notification when the seller confirms.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/marketplace"><Button variant="outline">Continue Shopping</Button></Link>
          <Link to="/profile"><Button>View Profile</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold">Cart is Empty</h1>
        <Link to="/marketplace"><Button>Browse Marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
        <span className="text-primary font-semibold">Cart</span>
        <span>→</span>
        <span className="text-primary font-semibold">Checkout</span>
        <span>→</span>
        <span>Confirmation</span>
      </div>

      <h1 className="text-2xl font-display font-bold">Checkout</h1>

      {/* Delivery address */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Delivery Address</h2>
          </div>
          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your delivery address" />
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Payment Method</h2>
          </div>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value={pm.id} id={pm.id} />
                <Label htmlFor={pm.id} className="flex-1 cursor-pointer">
                  <span className="font-medium text-sm">{pm.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{pm.desc}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm">
              <span>{i.title} ×{i.quantity}</span>
              <span>{i.currency} {(i.price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{currency} {deliveryFee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{currency} {total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-1.5" size="lg" onClick={placeOrder} disabled={placing || !address.trim()}>
        {placing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        Place Order ({currency} {total.toLocaleString()})
      </Button>
    </div>
  );
};

export default Checkout;

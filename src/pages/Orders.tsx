import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle, Clock, XCircle, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  currency: string;
  product_id: string;
  product_title?: string;
  product_image?: string;
}

interface Order {
  id: string;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_method: string | null;
  delivery_address: string | null;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  paid: { label: "Paid", color: "bg-blue-500", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-indigo-500", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-500", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
};

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

const Orders = () => {
  const { supabaseUser } = useAuth();
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseUser) return;
    const fetchOrders = async () => {
      // Fetch buyer orders
      const { data: bOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: false });

      if (bOrders) {
        const enriched = await enrichOrders(bOrders);
        setBuyerOrders(enriched);
      }

      // Fetch seller orders via seller_id
      const { data: sOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", supabaseUser.id)
        .order("created_at", { ascending: false });

      if (sOrders) {
        const enriched = await enrichOrders(sOrders);
        setSellerOrders(enriched);
      }

      setLoading(false);
    };
    fetchOrders();
  }, [supabaseUser]);

  const enrichOrders = async (orders: any[]): Promise<Order[]> => {
    const orderIds = orders.map(o => o.id);
    const { data: allItems } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    // Get product details
    const productIds = [...new Set(allItems?.map(i => i.product_id) || [])];
    const { data: products } = await supabase
      .from("products")
      .select("id, title, image_url")
      .in("id", productIds);

    const productMap = new Map(products?.map(p => [p.id, p]) || []);

    return orders.map(o => ({
      id: o.id,
      total_amount: o.total_amount,
      delivery_fee: o.delivery_fee,
      status: o.status,
      payment_method: o.payment_method,
      delivery_address: o.delivery_address,
      created_at: o.created_at,
      items: (allItems || [])
        .filter(i => i.order_id === o.id)
        .map(i => {
          const prod = productMap.get(i.product_id);
          return {
            ...i,
            product_title: prod?.title || "Product",
            product_image: prod?.image_url || undefined,
          };
        }),
    }));
  };

  const renderStatusTimeline = (currentStatus: string) => {
    const currentIdx = statusSteps.indexOf(currentStatus);
    if (currentStatus === "cancelled") {
      return (
        <div className="flex items-center gap-1 mt-2">
          <XCircle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive font-medium">Cancelled</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 mt-3">
        {statusSteps.map((s, i) => {
          const done = i <= currentIdx;
          return (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${done ? "bg-primary" : "bg-muted"}`} />
              {i < statusSteps.length - 1 && (
                <div className={`w-4 h-0.5 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
        <span className="text-[10px] text-muted-foreground ml-1">
          {statusSteps.map((s, i) => i <= currentIdx ? "" : "").join("")}
        </span>
      </div>
    );
  };

  const renderOrderCard = (order: Order) => {
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <Badge className={`${config.color} text-white text-xs gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>

          <div className="space-y-2 mb-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="w-full h-full object-cover rounded" />
                  ) : (
                    <Package className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_title}</p>
                  <p className="text-xs text-muted-foreground">
                    ×{item.quantity} · {item.currency} {item.unit_price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-bold">
              KES {order.total_amount.toLocaleString()}
            </span>
            {order.payment_method && (
              <span className="text-xs text-muted-foreground capitalize">{order.payment_method}</span>
            )}
          </div>

          {renderStatusTimeline(order.status)}
        </CardContent>
      </Card>
    );
  };

  if (!supabaseUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <Package className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold">Sign in to view orders</h1>
        <Link to="/auth/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">Track your purchases and sales</p>
        </div>
      </div>

      <Tabs defaultValue="buyer">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="buyer" className="flex-1">As Buyer ({buyerOrders.length})</TabsTrigger>
          <TabsTrigger value="seller" className="flex-1">As Seller ({sellerOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buyer">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : buyerOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
              <Link to="/marketplace"><Button variant="outline">Browse Marketplace</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">{buyerOrders.map(renderOrderCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="seller">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : sellerOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No orders for your products yet</p>
              <Link to="/marketplace"><Button variant="outline">List a Product</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">{sellerOrders.map(renderOrderCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;

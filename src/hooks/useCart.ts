import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  title: string;
  price: number;
  currency: string;
  image: string;
  seller: string;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabaseUser } = useAuth();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!supabaseUser) { setItems([]); setLoading(false); return; }
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(title, price, currency, image_url, user_id)")
      .eq("user_id", supabaseUser.id);

    if (data) {
      const sellerIds = [...new Set(data.map((d: any) => d.products?.user_id).filter(Boolean))];
      const { data: profiles } = await supabase.from("profiles_public" as any).select("user_id, full_name").in("user_id", sellerIds);
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      setItems(data.map((d: any) => ({
        id: d.id,
        product_id: d.product_id,
        quantity: d.quantity,
        title: d.products?.title || "",
        price: Number(d.products?.price || 0),
        currency: d.products?.currency || "KES",
        image: d.products?.image_url || "/placeholder.svg",
        seller: nameMap.get(d.products?.user_id) || "Unknown",
      })));
    }
    setLoading(false);
  }, [supabaseUser]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, qty = 1) => {
    if (!supabaseUser) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: supabaseUser.id, product_id: productId, quantity: qty },
      { onConflict: "user_id,product_id" }
    );
    if (error) toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Added to cart" }); fetchCart(); }
  }, [supabaseUser, fetchCart, toast]);

  const updateQuantity = useCallback(async (itemId: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
    fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!supabaseUser) return;
    await supabase.from("cart_items").delete().eq("user_id", supabaseUser.id);
    setItems([]);
  }, [supabaseUser]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency || "KES";

  return { items, loading, addToCart, updateQuantity, removeItem, clearCart, subtotal, currency, itemCount: items.length, refetch: fetchCart };
};

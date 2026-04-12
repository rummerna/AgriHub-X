import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface SavedItem {
  id: string;
  product_id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  seller: string;
}

export const useSavedItems = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { supabaseUser } = useAuth();
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    if (!supabaseUser) { setItems([]); setSavedIds(new Set()); setLoading(false); return; }
    const { data } = await supabase
      .from("saved_items")
      .select("*, products(title, price, currency, image_url, user_id)")
      .eq("user_id", supabaseUser.id);

    if (data) {
      const sellerIds = [...new Set(data.map((d: any) => d.products?.user_id).filter(Boolean))];
      const { data: profiles } = await supabase.from("profiles_public" as any as 'profiles').select("user_id, full_name").in("user_id", sellerIds);
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      setItems(data.map((d: any) => ({
        id: d.id,
        product_id: d.product_id,
        title: d.products?.title || "",
        price: Number(d.products?.price || 0),
        currency: d.products?.currency || "KES",
        image: d.products?.image_url || "/placeholder.svg",
        seller: nameMap.get(d.products?.user_id) || "Unknown",
      })));
      setSavedIds(new Set(data.map((d: any) => d.product_id)));
    }
    setLoading(false);
  }, [supabaseUser]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleSave = useCallback(async (productId: string) => {
    if (!supabaseUser) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    if (savedIds.has(productId)) {
      await supabase.from("saved_items").delete().eq("user_id", supabaseUser.id).eq("product_id", productId);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_items").insert({ user_id: supabaseUser.id, product_id: productId });
      toast({ title: "🔖 Saved!" });
    }
    fetch();
  }, [supabaseUser, savedIds, fetch, toast]);

  const removeSaved = useCallback(async (savedId: string) => {
    await supabase.from("saved_items").delete().eq("id", savedId);
    fetch();
  }, [fetch]);

  return { items, savedIds, loading, toggleSave, removeSaved, refetch: fetch };
};

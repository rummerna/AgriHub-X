import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Bookmark, Share2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useToast } from "@/hooks/use-toast";

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

const ProductDetail = ({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const { addToCart } = useCart();
  const { savedIds, toggleSave } = useSavedItems();
  const { toast } = useToast();

  if (!product) return null;

  const handleMessageSeller = async () => {
    if (!supabaseUser) {
      toast({ title: "Please sign in to message sellers", variant: "destructive" });
      return;
    }

    // Find seller user_id from products table
    const { data: productData } = await supabase
      .from("products")
      .select("user_id")
      .eq("id", product.id)
      .single();

    const sellerId = product.sellerId || productData?.user_id;
    if (!sellerId) {
      toast({ title: "Cannot find seller", variant: "destructive" });
      return;
    }

    if (sellerId === supabaseUser.id) {
      toast({ title: "This is your own listing" });
      return;
    }

    // Check if conversation exists
    const [p1, p2] = supabaseUser.id < sellerId ? [supabaseUser.id, sellerId] : [sellerId, supabaseUser.id];

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1_id.eq.${p1},participant_2_id.eq.${p2}),and(participant_1_id.eq.${p2},participant_2_id.eq.${p1})`)
      .maybeSingle();

    let convId: string;

    if (existing) {
      convId = existing.id;
    } else {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ participant_1_id: p1, participant_2_id: p2 })
        .select()
        .single();

      if (error || !newConv) {
        toast({ title: "Could not start conversation", description: error?.message, variant: "destructive" });
        return;
      }
      convId = newConv.id;
    }

    // Send initial message with product reference
    const msgText = `Hi! I'm interested in your listing: "${product.title}" (${product.currency} ${product.price.toLocaleString()})`;
    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: supabaseUser.id,
      message_text: msgText,
      message_type: "text",
    });

    await supabase.from("conversations").update({
      last_message_text: msgText,
      last_message_at: new Date().toISOString(),
      last_sender_id: supabaseUser.id,
    }).eq("id", convId);

    onClose();
    navigate("/messages", { state: { openConversation: convId } });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{product.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <img src={product.image} alt={product.title} className="w-20 h-20 opacity-40" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">{product.currency} {product.price.toLocaleString()}</p>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Sold by <span className="font-semibold text-foreground">{product.seller}</span></p>
            <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{product.county}, {product.country}</p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-1.5" onClick={handleMessageSeller}>
              <MessageCircle className="w-4 h-4" />Message Seller
            </Button>
            <Button variant="outline" size="icon" onClick={() => addToCart(product.id)}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => toggleSave(product.id)}>
              <Bookmark className={`w-4 h-4 ${savedIds.has(product.id) ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;

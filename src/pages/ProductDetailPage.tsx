import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, MessageCircle, ShoppingCart, Star, MapPin, CheckCircle,
  Loader2, Bookmark, BookmarkCheck, Package, Clock, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCurrency } from "@/hooks/useCurrency";
import ReviewList from "@/components/ReviewList";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const { addToCart } = useCart();
  const { savedIds, toggleSave } = useSavedItems();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", id).single();
      if (!p) { setLoading(false); return; }
      setProduct(p);

      const { data: profile } = await supabase.from("profiles_public" as any).select("*").eq("user_id", p.user_id).single();
      setSeller(profile);

      const { data: related } = await supabase.from("products")
        .select("id, title, price, currency, image_url, category")
        .eq("category", p.category).neq("id", p.id).limit(4);
      setRelatedProducts(related || []);

      setLoading(false);
    };
    load();
  }, [id]);

  const handleMessage = async () => {
    if (!supabaseUser || !product) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1_id.eq.${supabaseUser.id},participant_2_id.eq.${product.user_id}),and(participant_1_id.eq.${product.user_id},participant_2_id.eq.${supabaseUser.id})`)
      .limit(1);

    if (existing && existing.length > 0) {
      navigate(`/messages?c=${existing[0].id}`);
    } else {
      const { data: newConv } = await supabase.from("conversations").insert({
        participant_1_id: supabaseUser.id,
        participant_2_id: product.user_id,
        last_message_text: `Inquiry about: ${product.title}`,
      }).select("id").single();
      if (newConv) {
        await supabase.from("messages").insert({
          conversation_id: newConv.id,
          sender_id: supabaseUser.id,
          message_text: `Hi! I'm interested in "${product.title}" for ${product.currency || "KES"} ${Number(product.price).toLocaleString()}/${product.unit || "kg"}`,
        });
        navigate(`/messages?c=${newConv.id}`);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-lg font-medium">Product not found</p>
      <Link to="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link>
    </div>
  );

  const isSaved = savedIds.has(product.id);
  const isOwnProduct = supabaseUser?.id === product.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Link to="/marketplace"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Marketplace</Button></Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded-t-lg" />
              ) : (
                <Package className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-2xl font-display font-bold">{product.title}</h1>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(Number(product.price), product.currency || "KES")}
            </p>
            <span className="text-muted-foreground">/ {product.unit || "kg"}</span>
          </div>

          {product.quantity && (
            <p className="text-sm text-muted-foreground"><Package className="w-3.5 h-3.5 inline mr-1" />{product.quantity} {product.unit || "units"} available</p>
          )}

          {product.quality_grade && product.quality_grade !== "Ungraded" && (
            <Badge variant="outline">Grade: {product.quality_grade}</Badge>
          )}

          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

          {(product.county || product.country) && (
            <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{product.county}{product.county && product.country ? ", " : ""}{product.country}</p>
          )}

          {product.has_transport && <Badge variant="outline" className="text-xs">🚚 Transport available</Badge>}

          <div className="flex gap-2 pt-2">
            {!isOwnProduct && (
              <>
                <Button className="flex-1 gap-1.5" onClick={handleMessage} disabled={!supabaseUser}>
                  <MessageCircle className="w-4 h-4" /> Message to Buy
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={() => addToCart(product.id)}>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" onClick={() => toggleSave(product.id)}>
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Seller Card */}
      {seller && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {seller.full_name?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <p className="font-medium flex items-center gap-1">
                  {seller.full_name}
                  {seller.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {seller.rating_avg > 0 && (
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-accent fill-accent" />{Number(seller.rating_avg).toFixed(1)}</span>
                  )}
                  {seller.trade_count > 0 && (
                    <span><Package className="w-3 h-3 inline" /> {seller.trade_count} trades</span>
                  )}
                  <span><MapPin className="w-3 h-3 inline" /> {seller.county}, {seller.country}</span>
                </div>
              </div>
            </div>
            {!isOwnProduct && (
              <Button size="sm" variant="outline" onClick={handleMessage} disabled={!supabaseUser} className="gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> Contact
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seller Reviews */}
      {seller && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Seller Reviews</h3>
            <ReviewList userId={product.user_id} />
          </CardContent>
        </Card>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedProducts.map(r => (
              <Link key={r.id} to={`/marketplace/${r.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                      {r.image_url ? <img src={r.image_url} alt="" className="w-full h-full object-cover rounded" /> : <Package className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                    <p className="text-sm font-bold text-primary">{r.currency || "KES"} {Number(r.price).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

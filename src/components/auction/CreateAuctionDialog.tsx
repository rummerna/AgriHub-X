import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const categories = ["Crops", "Livestock", "Inputs", "Equipment"];
const units = ["kg", "tonnes", "crates", "pieces", "bags", "litres", "bunches"];
const durations = [
  { label: "1 Day", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "5 Days", hours: 120 },
  { label: "7 Days", hours: 168 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateAuctionDialog = ({ open, onClose, onCreated }: Props) => {
  const { supabaseUser, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    category: "Crops",
    quantity: "1",
    unit: "kg",
    starting_bid: "",
    reserve_price: "",
    duration: "72",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!supabaseUser) return;
    if (!form.product_name.trim() || !form.starting_bid) {
      toast({ title: "Missing fields", description: "Product name and starting bid are required.", variant: "destructive" });
      return;
    }

    const startingBid = Number(form.starting_bid);
    if (isNaN(startingBid) || startingBid <= 0) {
      toast({ title: "Invalid bid", description: "Starting bid must be a positive number.", variant: "destructive" });
      return;
    }

    // Check integrity score
    const { data: integrity } = await supabase
      .from("auction_integrity")
      .select("score")
      .eq("user_id", supabaseUser.id)
      .single();
    
    const score = integrity?.score ?? 100;
    if (score < 60) {
      toast({ title: "Cannot create auction", description: "Your auction integrity score is below 60.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const endTime = new Date(Date.now() + Number(form.duration) * 3600000).toISOString();

    const { error } = await supabase.from("auctions").insert({
      seller_id: supabaseUser.id,
      product_name: form.product_name.trim(),
      category: form.category,
      quantity: Number(form.quantity) || 1,
      unit: form.unit,
      starting_bid: startingBid,
      reserve_price: form.reserve_price ? Number(form.reserve_price) : null,
      end_time: endTime,
      description: form.description.trim(),
      country: user?.country || "",
      county: user?.county || "",
      currency: user?.currency || "KES",
      image_url: images[0] || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Auction created!", description: "Your auction is now live." });
    setForm({ product_name: "", category: "Crops", quantity: "1", unit: "kg", starting_bid: "", reserve_price: "", duration: "72", description: "" });
    setImages([]);
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Create Live Auction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Product Name *</Label>
            <Input value={form.product_name} onChange={(e) => set("product_name", e.target.value)} placeholder="e.g. Fresh Maize – 2 tonnes" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {durations.map((d) => <SelectItem key={d.hours} value={d.hours.toString()}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Starting Bid ({user?.currency || "KES"}) *</Label>
              <Input type="number" min="1" value={form.starting_bid} onChange={(e) => set("starting_bid", e.target.value)} placeholder="1000" />
            </div>
            <div>
              <Label>Reserve Price (optional)</Label>
              <Input type="number" min="0" value={form.reserve_price} onChange={(e) => set("reserve_price", e.target.value)} placeholder="Hidden minimum" />
            </div>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your product..." rows={3} />
          </div>

          <div>
            <Label>Auction Photos (Optional)</Label>
            <ImageUpload
              bucket="product-images"
              folder={supabaseUser?.id || "anon"}
              maxImages={5}
              images={images}
              onChange={setImages}
              showMainBadge
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Auction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAuctionDialog;

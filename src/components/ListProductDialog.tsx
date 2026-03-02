import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { marketplaceCategories, currencies } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/ImageUpload";

const units = ["kg", "tonnes", "bags", "crates", "pieces", "litres", "bundles", "bales"];
const grades = ["Grade A (Premium)", "Grade B (Standard)", "Grade C (Economy)", "Ungraded"];

interface Props {
  onProductListed?: () => void;
}

const ListProductDialog = ({ onProductListed }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minOrder, setMinOrder] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [description, setDescription] = useState("");
  const [hasTransport, setHasTransport] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();
  const { isLoggedIn, supabaseUser, user } = useAuth();

  const resetForm = () => {
    setTitle(""); setCategory(""); setGrade(""); setQuantity("");
    setUnit("kg"); setMinOrder(""); setPrice(""); setCurrency("KES");
    setDescription(""); setHasTransport(false); setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !supabaseUser) {
      toast({ title: "Sign in required", description: "Please sign in to list a product.", variant: "destructive" });
      return;
    }
    if (images.length === 0) {
      toast({ title: "Image required", description: "Please upload at least 1 product photo.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("products").insert({
      user_id: supabaseUser.id,
      title,
      category,
      quality_grade: grade || "Ungraded",
      quantity: quantity ? parseInt(quantity) : 1,
      unit,
      min_order: minOrder ? parseInt(minOrder) : 1,
      price: parseFloat(price),
      currency,
      description,
      has_transport: hasTransport,
      country: user?.country || "",
      county: user?.county || "",
      image_url: images[0],
    });

    setLoading(false);
    if (error) {
      toast({ title: "Failed to list product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product listed!", description: "Your product is now visible on the marketplace." });
      resetForm();
      setOpen(false);
      onProductListed?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> List Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">List a New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Fresh Maize (50kg)" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {marketplaceCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quality Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="100" required />
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Order</Label>
              <Input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="3500" required />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product quality, harvest date, availability..." rows={3} />
          </div>
          <div>
            <Label>Product Photos (Required, min 1)</Label>
            <ImageUpload
              bucket="product-images"
              folder={supabaseUser?.id || "anon"}
              maxImages={5}
              images={images}
              onChange={setImages}
              showMainBadge
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="transport" className="rounded" checked={hasTransport} onChange={e => setHasTransport(e.target.checked)} />
            <Label htmlFor="transport" className="text-sm font-normal">I can arrange transport / delivery</Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !title || !category || !price || images.length === 0}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Publishing...</> : "Publish Listing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListProductDialog;

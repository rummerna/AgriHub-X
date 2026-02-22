import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera } from "lucide-react";
import { marketplaceCategories, currencies } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";

const units = ["kg", "tonnes", "bags", "crates", "pieces", "litres", "bundles", "bales"];
const grades = ["Grade A (Premium)", "Grade B (Standard)", "Grade C (Economy)", "Ungraded"];

const ListProductDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Product listed!", description: "Your product is now visible on the marketplace." });
    setOpen(false);
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
            <Input placeholder="e.g. Fresh Maize (50kg)" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {marketplaceCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quality Grade</Label>
              <Select>
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
              <Input type="number" placeholder="100" required />
            </div>
            <div>
              <Label>Unit</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Order</Label>
              <Input type="number" placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price</Label>
              <Input type="number" placeholder="3500" required />
            </div>
            <div>
              <Label>Currency</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe your product quality, harvest date, availability..." rows={3} />
          </div>
          <div>
            <Label>Photos</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload product photos</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5 images, 5MB each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="transport" className="rounded" />
            <Label htmlFor="transport" className="text-sm font-normal">I can arrange transport / delivery</Label>
          </div>
          <Button type="submit" className="w-full">Publish Listing</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListProductDialog;

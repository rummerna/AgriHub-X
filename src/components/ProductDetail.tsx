import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Bookmark, Share2 } from "lucide-react";

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
}

const ProductDetail = ({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) => {
  if (!product) return null;

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
            <Button className="flex-1 gap-1.5"><MessageCircle className="w-4 h-4" />Message Seller</Button>
            <Button variant="outline" size="icon"><Bookmark className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, ShoppingCart, MessageCircle, Star } from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              N
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-display font-bold">Nixon Magenda</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <MapPin className="w-3 h-3" /> Machakos, Kenya
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap justify-center sm:justify-start">
                <Badge>Farmer</Badge>
                <Badge variant="secondary">Developer</Badge>
              </div>
            </div>
            <Button variant="outline" className="gap-1.5"><Edit className="w-4 h-4" /> Edit Profile</Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-muted-foreground">Listings</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">28</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <Star className="w-5 h-5 mx-auto mb-1 text-accent fill-accent" />
              <p className="text-lg font-bold">4.8</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

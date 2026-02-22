import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Edit, ShoppingCart, MessageCircle, Star, Camera, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { user, isLoggedIn } = useAuth();
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);

  const displayName = user?.name || "Nixon Magenda";
  const displayInitial = user?.initial || "N";
  const displayCounty = user?.county || "Machakos";
  const displayCountry = user?.country || "Kenya";
  const displayRoles = user?.roles || ["Farmer", "Developer"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            {/* Avatar with upload */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {displayInitial}
              </div>
              <button className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-background" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-display font-bold">{displayName}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <MapPin className="w-3 h-3" /> {displayCounty}, {displayCountry}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap justify-center sm:justify-start">
                {displayRoles.map((role) => (
                  <Badge key={role} className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => setEditing(!editing)}>
              <Edit className="w-4 h-4" /> {editing ? "Done" : "Edit Profile"}
            </Button>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Bio</label>
            {editing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                placeholder="Tell the community about yourself..."
                maxLength={160}
                rows={2}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{bio || "No bio yet. Click Edit Profile to add one."}</p>
            )}
            {editing && <p className="text-xs text-muted-foreground mt-1">{bio.length}/160</p>}
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

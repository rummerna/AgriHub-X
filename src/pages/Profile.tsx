import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Edit, ShoppingCart, MessageCircle, Star, Camera, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, isLoggedIn, supabaseUser, updateProfile } = useAuth();
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ listings: 0, posts: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayName = user?.name || "Guest";
  const displayInitial = user?.initial || "G";
  const displayCounty = user?.county || "";
  const displayCountry = user?.country || "";
  const displayRoles = user?.roles || [];

  // Load bio and avatar
  useEffect(() => {
    if (!supabaseUser) return;
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("bio, avatar_url").eq("user_id", supabaseUser.id).single();
      if (data) {
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url);
      }
      // Load stats
      const [{ count: listingCount }, { count: postCount }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", supabaseUser.id),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", supabaseUser.id),
      ]);
      setStats({ listings: listingCount || 0, posts: postCount || 0 });
    };
    loadProfile();
  }, [supabaseUser]);

  const handleSaveBio = async () => {
    if (!supabaseUser) return;
    setSaving(true);
    try {
      await updateProfile({ bio });
      toast({ title: "Profile updated" });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseUser) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${supabaseUser.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = urlData.publicUrl + "?t=" + Date.now();
    await updateProfile({ bio }); // ensure we don't lose bio
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", supabaseUser.id);
    setAvatarUrl(publicUrl);
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            {/* Avatar with upload */}
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {displayInitial}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-5 h-5 text-background animate-spin" /> : <Camera className="w-5 h-5 text-background" />}
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-display font-bold">{displayName}</h1>
              {(displayCounty || displayCountry) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="w-3 h-3" /> {displayCounty}{displayCounty && displayCountry ? ", " : ""}{displayCountry}
                </p>
              )}
              <div className="flex gap-1.5 mt-2 flex-wrap justify-center sm:justify-start">
                {displayRoles.map((role) => (
                  <Badge key={role} className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => editing ? handleSaveBio() : setEditing(true)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
              {editing ? "Save" : "Edit Profile"}
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
              <p className="text-lg font-bold">{stats.listings}</p>
              <p className="text-xs text-muted-foreground">Listings</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{stats.posts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <Star className="w-5 h-5 mx-auto mb-1 text-accent fill-accent" />
              <p className="text-lg font-bold">—</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

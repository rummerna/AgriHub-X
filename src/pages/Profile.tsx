import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MapPin, Edit, ShoppingCart, MessageCircle, Star, Camera, CheckCircle, Loader2, Bookmark, Package, CloudRain, Shield } from "lucide-react";
import ReviewList from "@/components/ReviewList";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/mock";

const scoreColor = (v: number) => v > 70 ? "bg-green-500" : v >= 40 ? "bg-yellow-500" : "bg-red-500";
const scoreLabel = (v: number) => v > 70 ? "Trustworthy" : v >= 40 ? "Needs improvement" : "At risk";

const Profile = () => {
  const { user, isLoggedIn, supabaseUser, updateProfile } = useAuth();
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ listings: 0, posts: 0 });
  const [scores, setScores] = useState({ marketplace_score: 50, community_score: 50, auction_score: 50, delivery_score: 50 });
  const [ratingAvg, setRatingAvg] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayName = user?.name || "Guest";
  const displayInitial = user?.initial || "G";
  const displayCounty = user?.county || "";
  const displayCountry = user?.country || "";
  const displayRoles = user?.roles || [];

  useEffect(() => {
    if (!supabaseUser) return;
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("bio, avatar_url, rating_avg, rating_count").eq("user_id", supabaseUser.id).single();
      if (data) {
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url);
        setRatingAvg(Number(data.rating_avg) || 0);
        setRatingCount(Number(data.rating_count) || 0);
      }
      }
      const [{ count: listingCount }, { count: postCount }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", supabaseUser.id),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", supabaseUser.id),
      ]);
      setStats({ listings: listingCount || 0, posts: postCount || 0 });

      // Load scores
      const { data: scoreData } = await supabase.from("user_scores").select("*").eq("user_id", supabaseUser.id).single();
      if (scoreData) {
        setScores({
          marketplace_score: scoreData.marketplace_score,
          community_score: scoreData.community_score,
          auction_score: scoreData.auction_score,
          delivery_score: scoreData.delivery_score,
        });
      }
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
    await updateProfile({ bio });
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", supabaseUser.id);
    setAvatarUrl(publicUrl);
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  const scoreEntries = [
    { label: "Marketplace Trust", value: scores.marketplace_score, icon: ShoppingCart },
    { label: "Community Behavior", value: scores.community_score, icon: MessageCircle },
    { label: "Auction Integrity", value: scores.auction_score, icon: Star },
    { label: "Delivery Reliability", value: scores.delivery_score, icon: Package },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {displayInitial}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" disabled={uploading}>
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
                  <Badge key={role} className="gap-1"><CheckCircle className="w-3 h-3" />{role}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/saved"><Button variant="outline" size="sm" className="gap-1"><Bookmark className="w-4 h-4" /> Saved</Button></Link>
              <Button variant="outline" className="gap-1.5" onClick={() => editing ? handleSaveBio() : setEditing(true)} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                {editing ? "Save" : "Edit Profile"}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Bio</label>
            {editing ? (
              <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="Tell the community about yourself..." maxLength={160} rows={2} />
            ) : (
              <p className="text-sm text-muted-foreground">{bio || "No bio yet. Click Edit Profile to add one."}</p>
            )}
            {editing && <p className="text-xs text-muted-foreground mt-1">{bio.length}/160</p>}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
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
              <p className="text-lg font-bold">{ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">Rating ({ratingCount})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Scores */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Trust & Credit Scores</h2>
          <div className="space-y-4">
            {scoreEntries.map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{value}/100</span>
                    <Badge variant="outline" className={`text-xs ${value >= 80 ? "text-green-600 border-green-300" : value >= 50 ? "text-yellow-600 border-yellow-300" : "text-red-600 border-red-300"}`}>
                      {scoreLabel(value)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${scoreColor(value)}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      {supabaseUser && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Reviews</h2>
            <ReviewList userId={supabaseUser.id} />
          </CardContent>
        </Card>
      )}

      {/* Weather Location Override */}
      <WeatherLocationCard
        profileCountry={displayCountry}
        profileCounty={displayCounty}
        userId={supabaseUser?.id}
      />

      {/* Quick Links */}
      <Card className="shadow-md">
        <CardContent className="p-4 space-y-2">
          <Link to="/orders" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">My Orders</span>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Link>
          <Link to="/saved" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Saved Items</span>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const WeatherLocationCard = ({ profileCountry, profileCounty, userId }: { profileCountry: string; profileCounty: string; userId?: string }) => {
  const [useCustom, setUseCustom] = useState(false);
  const [weatherCountry, setWeatherCountry] = useState("");
  const [weatherCounty, setWeatherCounty] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { updateProfile } = useAuth();

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("weather_location_country, weather_location_county").eq("user_id", userId).single().then(({ data }) => {
      if (data?.weather_location_country) {
        setUseCustom(true);
        setWeatherCountry(data.weather_location_country);
        setWeatherCounty(data.weather_location_county || "");
      }
    });
  }, [userId]);

  const selectedCountry = countries.find(c => c.name === weatherCountry);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      if (useCustom && weatherCountry && weatherCounty) {
        await supabase.from("profiles").update({ weather_location_country: weatherCountry, weather_location_county: weatherCounty }).eq("user_id", userId);
      } else {
        await supabase.from("profiles").update({ weather_location_country: null, weather_location_county: null }).eq("user_id", userId);
        setUseCustom(false);
      }
      // Refresh auth profile to propagate changes
      await updateProfile({});
      toast({ title: "Weather location updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from("profiles").update({ weather_location_country: null, weather_location_county: null }).eq("user_id", userId);
    await updateProfile({});
    setUseCustom(false);
    setWeatherCountry("");
    setWeatherCounty("");
    setSaving(false);
    toast({ title: "Using profile location for weather" });
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Weather & Brief Location</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Default: {profileCounty}{profileCounty && profileCountry ? ", " : ""}{profileCountry || "Not set"}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant={useCustom ? "default" : "outline"}
            size="sm"
            onClick={() => setUseCustom(!useCustom)}
          >
            {useCustom ? "Custom Location" : "Use Profile Location"}
          </Button>
        </div>

        {useCustom && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Country</Label>
              <Select value={weatherCountry} onValueChange={(v) => { setWeatherCountry(v); setWeatherCounty(""); }}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedCountry && (
              <div>
                <Label className="text-sm">County / Region</Label>
                <Select value={weatherCounty} onValueChange={setWeatherCounty}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>{selectedCountry.counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving || !weatherCountry || !weatherCounty}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} disabled={saving}>Reset to Profile</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;

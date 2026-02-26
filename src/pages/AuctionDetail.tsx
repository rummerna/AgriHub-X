import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Gavel, MapPin, Clock, User, Shield, Share2, Bookmark, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuctionCountdown from "@/components/auction/AuctionCountdown";

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  is_auto_bid: boolean;
  created_at: string;
  bidder_name?: string;
}

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { supabaseUser, isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState("");
  const [placing, setPlacing] = useState(false);
  const [sellerName, setSellerName] = useState("Unknown");
  const [integrityScore, setIntegrityScore] = useState<number | null>(null);

  const fetchAuction = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from("auctions").select("*").eq("id", id).single();
    if (data) {
      setAuction(data);
      // Get seller name
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", data.seller_id).single();
      if (profile) setSellerName(profile.full_name);
    }
    setLoading(false);
  }, [id]);

  const fetchBids = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("bids")
      .select("*")
      .eq("auction_id", id)
      .order("created_at", { ascending: false });
    if (data) {
      const userIds = [...new Set(data.map((b: any) => b.bidder_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name]) || []);
      setBids(data.map((b: any) => ({ ...b, bidder_name: nameMap.get(b.bidder_id) || "Anonymous" })));
    }
  }, [id]);

  const fetchIntegrity = useCallback(async () => {
    if (!supabaseUser) return;
    const { data } = await supabase
      .from("auction_integrity")
      .select("score")
      .eq("user_id", supabaseUser.id)
      .single();
    setIntegrityScore(data?.score ?? 100);
  }, [supabaseUser]);

  useEffect(() => {
    fetchAuction();
    fetchBids();
    fetchIntegrity();
  }, [fetchAuction, fetchBids, fetchIntegrity]);

  // Realtime for bids + auction updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`auction-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `auction_id=eq.${id}` }, () => {
        fetchBids();
        fetchAuction();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${id}` }, () => {
        fetchAuction();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchBids, fetchAuction]);

  const minBid = auction
    ? (auction.current_bid || auction.starting_bid) + Math.max(1, Math.floor((auction.current_bid || auction.starting_bid) * 0.02))
    : 0;

  const placeBid = async () => {
    if (!supabaseUser || !auction) return;

    if (integrityScore !== null && integrityScore < 40) {
      toast({ title: "Bidding restricted", description: "Your auction integrity score is too low to place bids.", variant: "destructive" });
      return;
    }

    const amount = Number(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast({ title: "Invalid bid", description: `Bid must be at least ${auction.currency} ${minBid.toLocaleString()}`, variant: "destructive" });
      return;
    }

    setPlacing(true);

    // Insert bid
    const { error: bidError } = await supabase.from("bids").insert({
      auction_id: auction.id,
      bidder_id: supabaseUser.id,
      amount,
      is_auto_bid: false,
    });

    if (bidError) {
      toast({ title: "Failed to place bid", description: bidError.message, variant: "destructive" });
      setPlacing(false);
      return;
    }

    // Update auction
    const updateData: any = {
      current_bid: amount,
      current_winner_id: supabaseUser.id,
      bids_count: auction.bids_count + 1,
    };

    // Auto-extend: if bid placed in last 3 minutes, extend by 3 minutes
    const msLeft = new Date(auction.end_time).getTime() - Date.now();
    if (msLeft < 180000 && msLeft > 0) {
      updateData.end_time = new Date(Date.now() + 180000).toISOString();
      toast({ title: "⏰ Auction extended!", description: "Bid placed in final 3 minutes – auction extended by 3 minutes." });
    }

    await supabase.from("auctions").update(updateData).eq("id", auction.id);

    setBidAmount("");
    setPlacing(false);
    toast({ title: "Bid placed!", description: `You bid ${auction.currency} ${amount.toLocaleString()}` });
  };

  const placeAutoBid = async () => {
    if (!supabaseUser || !auction) return;
    const max = Number(maxAutoBid);
    if (isNaN(max) || max < minBid) {
      toast({ title: "Invalid auto-bid", description: `Max must be at least ${auction.currency} ${minBid.toLocaleString()}`, variant: "destructive" });
      return;
    }

    setPlacing(true);
    const bidAmt = minBid; // Start at minimum

    const { error } = await supabase.from("bids").insert({
      auction_id: auction.id,
      bidder_id: supabaseUser.id,
      amount: bidAmt,
      is_auto_bid: true,
    });

    if (!error) {
      const updateData: any = {
        current_bid: bidAmt,
        current_winner_id: supabaseUser.id,
        bids_count: auction.bids_count + 1,
      };
      const msLeft = new Date(auction.end_time).getTime() - Date.now();
      if (msLeft < 180000 && msLeft > 0) {
        updateData.end_time = new Date(Date.now() + 180000).toISOString();
      }
      await supabase.from("auctions").update(updateData).eq("id", auction.id);
      toast({ title: "Auto-bid set!", description: `Auto-bidding up to ${auction.currency} ${max.toLocaleString()}` });
    }

    setPlacing(false);
    setMaxAutoBid("");
  };

  const isEnded = auction && (auction.status === "ended" || new Date(auction.end_time) < new Date());
  const isSeller = supabaseUser && auction?.seller_id === supabaseUser.id;
  const reserveMet = auction?.reserve_price ? (auction.current_bid || 0) >= auction.reserve_price : true;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-lg font-medium text-muted-foreground">Auction not found</p>
        <Link to="/auctions"><Button variant="outline" className="mt-4">Back to Auctions</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link to="/auctions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image + Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] bg-muted rounded-xl overflow-hidden">
            <img
              src={auction.image_url || "/placeholder.svg"}
              alt={auction.product_name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-display font-bold">{auction.product_name}</h1>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><Share2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Bookmark className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{auction.county}, {auction.country}</span>
              <Badge variant="secondary">{auction.category}</Badge>
              <span>{auction.quantity} {auction.unit}</span>
            </div>
          </div>

          {auction.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{auction.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {sellerName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{sellerName}</p>
                <p className="text-xs text-muted-foreground">Seller</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" /> Verified
              </div>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bid History ({bids.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {bids.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No bids yet. Be the first!</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bids.map((b, i) => (
                    <div key={b.id} className={`flex items-center justify-between text-sm py-2 ${i < bids.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {(b.bidder_name || "?").charAt(0)}
                        </div>
                        <span className="font-medium">{b.bidder_name}</span>
                        {b.is_auto_bid && <Badge variant="outline" className="text-[10px] h-4">Auto</Badge>}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary">{auction.currency} {b.amount.toLocaleString()}</span>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Bidding Panel */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-5 space-y-4">
              {/* Status */}
              {isEnded ? (
                <Badge variant="destructive" className="w-full justify-center py-1.5 text-sm">Auction Ended</Badge>
              ) : (
                <div className={`flex items-center gap-1.5 text-sm font-medium ${
                  new Date(auction.end_time).getTime() - Date.now() < 3600000 ? "text-destructive" :
                  new Date(auction.end_time).getTime() - Date.now() < 21600000 ? "text-accent" : "text-primary"
                }`}>
                  <Clock className="w-4 h-4" />
                  <AuctionCountdown endTime={auction.end_time} onEnd={() => fetchAuction()} />
                </div>
              )}

              {/* Current Bid */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {auction.current_bid ? "Current Bid" : "Starting Bid"}
                </p>
                <p className="text-3xl font-display font-bold text-primary">
                  {auction.currency} {(auction.current_bid || auction.starting_bid).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{auction.bids_count} bid{auction.bids_count !== 1 ? "s" : ""}</p>
              </div>

              {/* Reserve status */}
              {auction.reserve_price && (
                <div className={`flex items-center gap-1.5 text-xs ${reserveMet ? "text-primary" : "text-destructive"}`}>
                  {reserveMet ? "✅ Reserve price met" : "⚠️ Reserve price not met"}
                </div>
              )}

              <Separator />

              {/* Anti-snipe notice */}
              {!isEnded && new Date(auction.end_time).getTime() - Date.now() < 300000 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/10 text-xs">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Bids in the last 3 minutes auto-extend the auction by 3 minutes.</span>
                </div>
              )}

              {/* Bid Controls */}
              {!isEnded && isLoggedIn && !isSeller && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Min bid: {auction.currency} {minBid.toLocaleString()}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder={minBid.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minBid}
                      />
                      <Button onClick={placeBid} disabled={placing} className="gap-1.5 shrink-0">
                        {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                        Bid
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto-bid</Label>
                      <Switch checked={autoBidEnabled} onCheckedChange={setAutoBidEnabled} />
                    </div>
                    {autoBidEnabled && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Max auto-bid amount</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            placeholder="Enter max amount"
                            value={maxAutoBid}
                            onChange={(e) => setMaxAutoBid(e.target.value)}
                          />
                          <Button variant="secondary" onClick={placeAutoBid} disabled={placing} className="shrink-0">
                            Set
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          System will bid on your behalf up to this amount.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {isSeller && !isEnded && (
                <p className="text-sm text-muted-foreground text-center">You cannot bid on your own auction</p>
              )}

              {!isLoggedIn && (
                <Link to="/auth/login">
                  <Button className="w-full">Sign in to bid</Button>
                </Link>
              )}

              {isEnded && auction.current_winner_id && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">🏆 Auction won for {auction.currency} {auction.current_bid?.toLocaleString()}</p>
                  <Button variant="outline" className="w-full">Contact Seller</Button>
                </div>
              )}

              {/* Integrity */}
              {isLoggedIn && integrityScore !== null && integrityScore < 60 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Your auction integrity score ({integrityScore}) limits your participation.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;

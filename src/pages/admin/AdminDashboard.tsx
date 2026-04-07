import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Package, ShoppingCart, Shield, Search, CheckCircle, XCircle, Loader2,
  ArrowLeft, AlertTriangle, Lightbulb, TrendingUp, DollarSign, Trash2, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  totalServices: number;
}

interface UserRow {
  user_id: string;
  full_name: string;
  email: string | null;
  country: string | null;
  county: string | null;
  role: string | null;
  verified: boolean | null;
  verification_status: string | null;
  trade_count: number | null;
  rating_avg: number | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, totalListings: 0, totalOrders: 0, totalRevenue: 0,
    pendingVerifications: 0, totalServices: 0,
  });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<UserRow[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [
      { count: userCount },
      { count: listingCount },
      { count: orderCount },
      { count: serviceCount },
      { data: allUsers },
      { data: allListings },
      { data: allOrders },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    const pendingUsers = allUsers?.filter(u => u.verification_status === "pending") || [];
    const revenue = allOrders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;

    setStats({
      totalUsers: userCount || 0,
      totalListings: listingCount || 0,
      totalOrders: orderCount || 0,
      totalRevenue: revenue,
      pendingVerifications: pendingUsers.length,
      totalServices: serviceCount || 0,
    });
    setUsers(allUsers || []);
    setVerifications(pendingUsers);
    setListings(allListings || []);
    setOrders(allOrders || []);
    setLoading(false);
  };

  const handleVerification = async (userId: string, status: "verified" | "rejected") => {
    await supabase.from("profiles").update({
      verification_status: status,
      verified: status === "verified",
    }).eq("user_id", userId);

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "verification",
      message: status === "verified"
        ? "✅ Your account has been verified! You now have a verified badge."
        : "❌ Your verification request was not approved at this time.",
    });

    toast({ title: `User ${status}` });
    loadData();
  };

  const handleRemoveListing = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Listing removed" });
    loadData();
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const statCards = [
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Listings", value: stats.totalListings, icon: Package, color: "text-secondary" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-accent" },
    { label: "Revenue (KES)", value: stats.totalRevenue.toLocaleString(), icon: DollarSign, color: "text-primary" },
    { label: "Services", value: stats.totalServices, icon: Shield, color: "text-secondary" },
    { label: "Pending Verif.", value: stats.pendingVerifications, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform management & oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          <TabsTrigger value="listings" className="flex-1">Listings</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
          <TabsTrigger value="verifications" className="flex-1 relative">
            Verifications
            {stats.pendingVerifications > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5">{stats.pendingVerifications}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Platform Summary</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">• {stats.totalUsers} registered users</p>
                  <p className="text-muted-foreground">• {stats.totalListings} product listings</p>
                  <p className="text-muted-foreground">• {stats.totalServices} service listings</p>
                  <p className="text-muted-foreground">• {stats.totalOrders} orders processed</p>
                  <p className="text-muted-foreground">• KES {stats.totalRevenue.toLocaleString()} total volume</p>
                  {stats.pendingVerifications > 0 && (
                    <p className="text-destructive font-medium">⚠ {stats.pendingVerifications} pending verifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Recent Orders</h3>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs font-mono">#{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">KES {Number(o.total_amount).toLocaleString()}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <Card key={u.user_id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {u.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {u.full_name || "Unnamed"}
                        {u.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email} · {u.county}, {u.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{u.role || "farmer"}</Badge>
                    {u.rating_avg && Number(u.rating_avg) > 0 && (
                      <Badge variant="secondary" className="text-xs">★ {Number(u.rating_avg).toFixed(1)}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{u.trade_count || 0} trades</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-2">
          {listings.map(l => (
            <Card key={l.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    {l.image_url ? <img src={l.image_url} alt="" className="w-full h-full object-cover rounded" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.category} · {l.currency || "KES"} {Number(l.price).toLocaleString()} · {l.county}, {l.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveListing(l.id)} className="gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="space-y-2">
          {orders.map(o => (
            <Card key={o.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-mono">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()} · {o.payment_method || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">KES {Number(o.total_amount).toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs capitalize">{o.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verifications" className="space-y-3">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending verification requests</p>
              </CardContent>
            </Card>
          ) : (
            verifications.map(u => (
              <Card key={u.user_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {u.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email} · {u.county}, {u.country} · {u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleVerification(u.user_id, "verified")} className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleVerification(u.user_id, "rejected")} className="gap-1">
                        <XCircle className="w-3 h-3" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

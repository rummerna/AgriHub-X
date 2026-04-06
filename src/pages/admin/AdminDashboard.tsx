import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, Package, ShoppingCart, Shield, AlertTriangle, Search, CheckCircle, XCircle, Loader2, ArrowLeft, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  pendingVerifications: number;
}

interface UserRow {
  user_id: string;
  full_name: string;
  email: string | null;
  country: string | null;
  role: string | null;
  verified: boolean | null;
  verification_status: string | null;
  created_at: string;
}

interface ListingRow {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string | null;
  user_id: string;
  created_at: string;
  seller_name?: string;
}

const AdminDashboard = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalListings: 0, totalOrders: 0, pendingVerifications: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [verifications, setVerifications] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [
      { count: userCount },
      { count: listingCount },
      { count: orderCount },
      { data: allUsers },
      { data: allListings },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("user_id, full_name, email, country, role, verified, verification_status, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("id, title, category, price, currency, user_id, created_at").order("created_at", { ascending: false }).limit(100),
    ]);

    const pendingUsers = allUsers?.filter(u => u.verification_status === "pending") || [];

    setStats({
      totalUsers: userCount || 0,
      totalListings: listingCount || 0,
      totalOrders: orderCount || 0,
      pendingVerifications: pendingUsers.length,
    });
    setUsers(allUsers || []);
    setVerifications(pendingUsers);
    setListings(allListings || []);
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
        ? "Your account has been verified! You now have a verified badge."
        : "Your verification request was reviewed and not approved at this time.",
    });

    toast({ title: `User ${status}` });
    loadData();
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform management & oversight</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
          { label: "Listings", value: stats.totalListings, icon: Package, color: "text-green-600" },
          { label: "Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-purple-600" },
          { label: "Pending Verifications", value: stats.pendingVerifications, icon: Shield, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          <TabsTrigger value="listings" className="flex-1">Listings</TabsTrigger>
          <TabsTrigger value="verifications" className="flex-1">
            Verifications
            {stats.pendingVerifications > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">{stats.pendingVerifications}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">• {stats.totalUsers} registered users across the platform</p>
                <p className="text-sm text-muted-foreground">• {stats.totalListings} active product listings</p>
                <p className="text-sm text-muted-foreground">• {stats.totalOrders} orders processed</p>
                {stats.pendingVerifications > 0 && (
                  <p className="text-sm text-amber-600 font-medium">• {stats.pendingVerifications} verification requests need review</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <Card key={u.user_id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {u.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {u.full_name || "Unnamed"}
                        {u.verified && <CheckCircle className="w-3 h-3 text-primary" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{u.role || "farmer"}</Badge>
                    <Badge variant="outline" className="text-xs">{u.country || "—"}</Badge>
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
                <div>
                  <p className="text-sm font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.category} · {l.currency || "KES"} {l.price.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
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
                    <div>
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email} · {u.country}</p>
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

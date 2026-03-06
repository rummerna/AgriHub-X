import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, TrendingUp, CloudRain, Users, Newspaper, ShoppingCart, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  reference_id: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  new_message: <MessageCircle className="w-4 h-4 text-primary" />,
  new_order: <ShoppingCart className="w-4 h-4 text-primary" />,
  price: <TrendingUp className="w-4 h-4 text-secondary" />,
  weather: <CloudRain className="w-4 h-4 text-primary" />,
  community: <Users className="w-4 h-4 text-accent" />,
  reaction: <Users className="w-4 h-4 text-accent" />,
  brief: <Newspaper className="w-4 h-4 text-primary" />,
};

const Notifications = () => {
  const { supabaseUser, isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!supabaseUser) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!supabaseUser) return;
    const channel = supabase
      .channel("user-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${supabaseUser.id}` }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabaseUser]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!supabaseUser) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", supabaseUser.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <h1 className="text-2xl font-display font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Please sign in to see your notifications.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
            {unreadCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{unreadCount}</span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">Stay updated on what matters</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1">
            <Check className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-shadow hover:shadow-md cursor-pointer ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => markRead(n.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                {iconMap[n.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                <div className="flex-1">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

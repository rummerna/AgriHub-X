import { Card, CardContent } from "@/components/ui/card";
import { Bell, MessageCircle, TrendingUp, CloudRain, Users, Newspaper } from "lucide-react";
import { notifications } from "@/data/mock";

const iconMap: Record<string, React.ReactNode> = {
  message: <MessageCircle className="w-4 h-4 text-primary" />,
  price: <TrendingUp className="w-4 h-4 text-secondary" />,
  weather: <CloudRain className="w-4 h-4 text-primary" />,
  community: <Users className="w-4 h-4 text-accent" />,
  brief: <Newspaper className="w-4 h-4 text-primary" />,
};

const Notifications = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1 flex items-center gap-2"><Bell className="w-6 h-6" /> Notifications</h1>
      <p className="text-muted-foreground mb-6 text-sm">Stay updated on what matters</p>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className={`transition-shadow hover:shadow-md ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {iconMap[n.type]}
              <div className="flex-1">
                <p className="text-sm">{n.text}</p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-accent" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;

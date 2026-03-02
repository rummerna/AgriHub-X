import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/marketplace", label: "Market", icon: ShoppingCart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

const MobileNav = () => {
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          const isProfile = to === "/profile";
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {isProfile && isLoggedIn ? (
                <div className={`w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground`}>
                  {user?.initial || "U"}
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

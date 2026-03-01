import { Link, useLocation } from "react-router-dom";
import { Search, Bell, User, ShoppingCart, Users, HelpCircle, Wrench, Leaf, LogOut, Gavel, Sprout } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { to: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { to: "/community", label: "Community", icon: Users },
  { to: "/ask-agri", label: "Ask Agri", icon: HelpCircle },
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/auctions", label: "Auctions", icon: Gavel },
  { to: "/digital-twin", label: "Farm Twin", icon: Sprout },
];

const DesktopNav = () => {
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 bg-card border-b border-border sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-display font-bold text-primary">AgriHubX</span>
      </Link>

      <div className="flex-1 max-w-md mx-6">
        <Link to="/search" className="block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crops, services, weather…"
              className="pl-10 bg-muted border-0 cursor-pointer"
              readOnly
            />
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-1">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Button
              variant={location.pathname === to ? "default" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          </Link>
        ))}
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
        </Link>
        {isLoggedIn ? (
          <>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="relative">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {user?.initial || "U"}
                </div>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Join Free</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default DesktopNav;

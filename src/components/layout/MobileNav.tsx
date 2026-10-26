import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Users,
  HelpCircle,
  MoreHorizontal,
  Wrench,
  Gavel,
  Sprout,
  Package,
  Bookmark,
  User,
  MessageCircle,
  LogOut,
  LogIn,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { to: "/community", label: "Community", icon: Users },
  { to: "/ask-agri", label: "Ask Agri", icon: HelpCircle },
];

const moreRoutes = [
  "/services",
  "/auctions",
  "/digital-twin",
  "/orders",
  "/saved",
  "/profile",
  "/messages",
];

const sheetLinks = [
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/auctions", label: "Auctions", icon: Gavel },
  { to: "/digital-twin", label: "Farm Twin", icon: Sprout },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/saved", label: "Saved Items", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/messages", label: "Messages", icon: MessageCircle },
];

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreRoutes.some((r) => location.pathname.startsWith(r));

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-14">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 rounded-lg min-h-[44px] transition-colors ${
                  active ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-none">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 rounded-lg min-h-[44px] transition-colors ${
              moreActive ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-2 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-base text-left">More</SheetTitle>
          </SheetHeader>
          <div className="space-y-0.5">
            {sheetLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 h-12 px-4 rounded-lg text-sm font-medium transition-colors ${
                    active ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 h-12 w-full px-4 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                Logout
              </button>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 h-12 px-4 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <LogIn className="w-5 h-5 shrink-0" />
                Sign In
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;

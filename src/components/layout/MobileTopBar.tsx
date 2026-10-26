import { Link } from "react-router-dom";
import { Search, Bell, MessageCircle, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AgriHubXLogo from "@/components/AgriHubXLogo";

const iconBtn =
  "flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full text-foreground hover:bg-muted active:bg-muted transition-colors";

const MobileTopBar = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-2">
        <Link to="/" aria-label="AgriHubX home" className="flex items-center pl-1 pr-2 min-h-[44px]">
          <AgriHubXLogo size="sm" />
        </Link>

        <nav className="flex items-center">
          <Link to="/search" aria-label="Search" className={iconBtn}>
            <Search className="w-5 h-5" />
          </Link>
          <Link to="/messages" aria-label="Messages" className={iconBtn}>
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link to="/notifications" aria-label="Notifications" className={`${iconBtn} relative`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full" />
          </Link>
          {isLoggedIn ? (
            <Link to="/profile" aria-label="Profile" className="flex items-center justify-center min-w-[44px] min-h-[44px] pr-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {user?.initial || "U"}
              </div>
            </Link>
          ) : (
            <Link to="/auth/login" aria-label="Sign in" className={iconBtn}>
              <LogIn className="w-5 h-5" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MobileTopBar;

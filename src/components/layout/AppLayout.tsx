import { Outlet } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const AppLayout = () => {
  const { user } = useAuth();
  useTheme(user?.country || "Kenya");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DesktopNav />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default AppLayout;

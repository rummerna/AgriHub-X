import { Outlet } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileTopBar from "./MobileTopBar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const AppLayout = () => {
  const { user } = useAuth();
  useTheme(user?.country || "Kenya");

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 lg:pb-0">
      <DesktopNav />
      <MobileTopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default AppLayout;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Community from "./pages/Community";
import AskAgri from "./pages/AskAgri";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Brief from "./pages/Brief";
import Weather from "./pages/Weather";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import DigitalTwin from "./pages/DigitalTwin";
import Messages from "./pages/Messages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* App routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/community" element={<Community />} />
            <Route path="/ask-agri" element={<AskAgri />} />
            <Route path="/services" element={<Services />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/brief" element={<Brief />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/messages" element={<Messages />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

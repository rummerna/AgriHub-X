import { Link } from "react-router-dom";
import AgriHubXLogo from "@/components/AgriHubXLogo";

const Footer = () => (
  <footer className="bg-card border-t border-border py-8 px-4 hidden md:block">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="mb-3">
            <AgriHubXLogo size="md" />
          </div>
          <p className="text-xs text-muted-foreground">Connect. Trade. Grow. Globally.</p>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Platform</p>
          <nav className="space-y-1">
            <Link to="/marketplace" className="block text-xs text-muted-foreground hover:text-primary">Marketplace</Link>
            <Link to="/community"   className="block text-xs text-muted-foreground hover:text-primary">Community</Link>
            <Link to="/ask-agri"    className="block text-xs text-muted-foreground hover:text-primary">Ask Agri</Link>
            <Link to="/services"    className="block text-xs text-muted-foreground hover:text-primary">Services</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Company</p>
          <nav className="space-y-1">
            <Link to="/about"    className="block text-xs text-muted-foreground hover:text-primary">About Us</Link>
            <Link to="/blog"     className="block text-xs text-muted-foreground hover:text-primary">Blog</Link>
            <Link to="/careers"  className="block text-xs text-muted-foreground hover:text-primary">Careers</Link>
            <Link to="/press"    className="block text-xs text-muted-foreground hover:text-primary">Press</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Legal</p>
          <nav className="space-y-1">
            <Link to="/privacy" className="block text-xs text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link to="/terms"   className="block text-xs text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link to="/support" className="block text-xs text-muted-foreground hover:text-primary">Support</Link>
            <Link to="/contact" className="block text-xs text-muted-foreground hover:text-primary">Contact</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Nixon Magenda & Blessed Muriuki, St. John Tala High School. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

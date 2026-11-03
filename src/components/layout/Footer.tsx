import { Link } from "react-router-dom";
import AgriHubXLogo from "@/components/AgriHubXLogo";

const Footer = () => (
  <footer className="bg-card border-t border-border py-8 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-2 lg:col-span-4 min-w-0">
          <div className="mb-3 max-w-full">
            <AgriHubXLogo size="md" className="max-w-full" />
          </div>
          <p className="text-sm lg:text-xs text-muted-foreground">Connect. Trade. Grow. Globally.</p>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Platform</p>
          <nav className="space-y-1">
            <Link to="/marketplace" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Marketplace</Link>
            <Link to="/community" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Community</Link>
            <Link to="/ask-agri" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Ask Agri</Link>
            <Link to="/services" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Services</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Company</p>
          <nav className="space-y-1">
            <Link to="/about" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">About Us</Link>
            <Link to="/blog" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Blog</Link>
            <Link to="/careers" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Careers</Link>
            <Link to="/press" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Press</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Legal</p>
          <nav className="space-y-1">
            <Link to="/privacy" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Privacy Policy</Link>
            <Link to="/terms" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Terms of Service</Link>
            <Link to="/support" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Support</Link>
            <Link to="/contact" className="flex items-center min-h-11 py-2 text-sm lg:text-sm lg:text-xs text-muted-foreground hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Contact</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border pt-4 text-center">
        <p className="text-sm lg:text-xs text-muted-foreground">© 2026 Nixon Magenda. Sponsored by Valor Incorporated. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

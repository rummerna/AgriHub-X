import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, User, ShoppingCart, Users, Cpu, Shield, Mail, MapPin } from "lucide-react";

const categories = [
  { icon: BookOpen, label: "Getting Started", count: 4 },
  { icon: User, label: "Account & Profile", count: 3 },
  { icon: ShoppingCart, label: "Marketplace", count: 5 },
  { icon: Users, label: "Community", count: 3 },
  { icon: Cpu, label: "AI Ask Agri", count: 3 },
  { icon: Shield, label: "Privacy & Security", count: 4 },
];

const popularArticles = [
  "How to Create Your First Listing",
  "Using AI to Diagnose Crop Diseases",
  "Understanding Privacy Settings (No GPS Tracking)",
  "How to Connect with Other Farmers",
];

const Support = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-display font-bold text-center mb-2">How Can We Help?</h1>
    <p className="text-center text-muted-foreground mb-6">Search our help articles or browse by category</p>

    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder="Search support articles…" className="pl-10" />
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
      {categories.map(({ icon: Icon, label, count }) => (
        <Card key={label} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{count} articles</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <section className="mb-8">
      <h2 className="text-lg font-display font-semibold mb-3">Popular Articles</h2>
      <div className="space-y-2">
        {popularArticles.map((a) => (
          <Card key={a} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 text-sm">{a}</CardContent>
          </Card>
        ))}
      </div>
    </section>

    <div className="grid sm:grid-cols-2 gap-4">
      <Card><CardContent className="p-4 flex items-start gap-3"><Mail className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Email Support</p><p className="text-sm text-muted-foreground">rummerna@gmail.com</p></div></CardContent></Card>
      <Card><CardContent className="p-4 flex items-start gap-3"><MapPin className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Visit Us</p><p className="text-sm text-muted-foreground">St. John Tala High School</p></div></CardContent></Card>
    </div>
  </div>
);

export default Support;

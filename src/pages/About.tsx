import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Cpu, Globe, Users, Lightbulb, Eye, Heart } from "lucide-react";

const differentiators = [
  { icon: Shield, label: "No GPS Tracking", desc: "Privacy by design with voluntary location sharing only" },
  { icon: Cpu, label: "AI-Powered Assistance", desc: "Smart crop advice, pest detection, demand forecasting" },
  { icon: Globe, label: "International Standards", desc: "Multi-language, multi-currency, global scaling" },
  { icon: Users, label: "Community-First", desc: "Gamified engagement with reputation rewards" },
  { icon: Eye, label: "Farmer-Centric Design", desc: "Accessible to non-technical users" },
  { icon: Heart, label: "Trust-Based", desc: "Verified portfolios and escrow" },
  { icon: Lightbulb, label: "Environmental Intelligence", desc: "Hyper-local weather, pest maps, climate advisory" },
];

const values = [
  { title: "Privacy First", desc: "User data belongs to users" },
  { title: "Trust Through Transparency", desc: "Verified profiles and secure escrow" },
  { title: "Community Power", desc: "Farmers helping farmers" },
  { title: "Innovation for Impact", desc: "AI serving real needs" },
  { title: "Global Reach, Local Relevance", desc: "Culturally adapted solutions" },
];

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-12">
        <Badge className="mb-3">Our Story</Badge>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Born from a Dying Pawpaw Tree</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          When Blessed Muriuki's pawpaw tree began dying, he searched for reliable agricultural information — and found none.
          That frustration sparked an idea: what if every farmer had access to trusted advice, a fair marketplace, and a supportive community?
          AgriHubX was born.
        </p>
      </section>

      {/* Founders */}
      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-primary-foreground">B</div>
            <h3 className="font-display font-bold text-lg">Blessed Muriuki</h3>
            <p className="text-sm text-muted-foreground mb-2">Concept & Research Lead</p>
            <p className="text-sm text-muted-foreground">Rode his bicycle across Tala to interview 25 farmers, documenting their challenges to shape AgriHubX's features and priorities.</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-secondary-foreground">N</div>
            <h3 className="font-display font-bold text-lg">Nixon Magenda</h3>
            <p className="text-sm text-muted-foreground mb-2">Developer</p>
            <p className="text-sm text-muted-foreground">Self-taught programmer who coded the entire platform from scratch — every line written specifically for AgriHubX.</p>
          </CardContent>
        </Card>
      </section>

      {/* Differentiators */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-center mb-6">What Makes Us Different</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentiators.map(({ icon: Icon, label, desc }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{label}</h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-8">
        <h2 className="text-2xl font-display font-bold text-center mb-6">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {values.map((v) => (
            <div key={v.title} className="p-4 rounded-xl bg-muted">
              <h4 className="font-semibold text-sm">{v.title}</h4>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supporter */}
      <section className="text-center py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Proudly supported by <strong>St. John Tala High School</strong></p>
        <p className="text-xs text-muted-foreground mt-1">© 2026 Nixon Magenda & Blessed Muriuki. All rights reserved.</p>
      </section>
    </div>
  );
};

export default About;

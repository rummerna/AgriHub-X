import { Card, CardContent } from "@/components/ui/card";
import { Shield, Rocket, Eye, Target, Code } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Building the Future of Agriculture</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AgriHubX is a platform designed to connect farmers, improve decision-making, and create fair opportunities across the agricultural ecosystem.
        </p>
      </section>

      {/* What We Do */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-3">What is AgriHubX?</h2>
        <p className="text-muted-foreground">
          AgriHubX is an evolving agricultural platform focused on solving key challenges faced by farmers, including market access, pricing transparency, and access to reliable information. We are building tools that simplify how farmers connect, trade, and make decisions.
        </p>
      </section>

      {/* Our Goal */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-3">Our Goal</h2>
        <p className="text-muted-foreground">
          Our goal is to create a system where farmers can operate with confidence, access better markets, and make smarter decisions using technology.
        </p>
      </section>

      {/* In Development */}
      <section>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold mb-2">Currently in Development</h2>
              <p className="text-muted-foreground">
                AgriHubX is actively being developed, with multiple features being refined to ensure a smooth and reliable experience. We are focused on delivering a platform that is simple, secure, and effective.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy */}
      <section>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold mb-2">Privacy First</h2>
              <p className="text-muted-foreground">
                We prioritize user privacy and data protection by minimizing data collection and ensuring secure handling of all information.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Founder */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-3">Founder</h2>
        <p className="text-muted-foreground">
          AgriHubX is an independent project currently being developed and refined with a focus on long-term impact and innovation.
        </p>
      </section>

      {/* Coming Soon */}
      <section className="text-center py-6 border-t border-border">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
          <Rocket className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">More Coming Soon</h2>
        <p className="text-sm text-muted-foreground">
          More updates, features, and information will be added as development progresses.
        </p>
      </section>
    </div>
  );
};

export default About;

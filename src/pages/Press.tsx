import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

const coverage = [
  { date: "Feb 2026", title: "St. John Tala High School Students Create Farming App", source: "Local News" },
  { date: "Jan 2026", title: "How Two Students Interviewed 25 Farmers on Bicycles to Build AgriHubX", source: "Education News" },
  { date: "Dec 2025", title: "Student Innovation: AgriHubX Selected for KSEF", source: "School Newsletter" },
];

const Press = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-display font-bold text-center mb-2">AgriHubX in the News</h1>
    <p className="text-center text-muted-foreground mb-8">Press releases, media coverage, and press kit</p>

    <section className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">Recent Coverage</h2>
      <div className="space-y-3">
        {coverage.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="text-xs mb-1">{item.date}</Badge>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.source}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="shadow-md">
        <CardContent className="p-6 text-center">
          <Download className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="font-semibold mb-1">Press Kit</h3>
          <p className="text-sm text-muted-foreground mb-3">Logo, screenshots, and founder bios</p>
          <Button variant="outline">Download Press Kit</Button>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardContent className="p-6 text-center">
          <Mail className="w-8 h-8 mx-auto text-primary mb-2" />
          <h3 className="font-semibold mb-1">Media Contact</h3>
          <p className="text-sm text-muted-foreground mb-3">rummerna@gmail.com</p>
          <Button variant="outline">Send Press Inquiry</Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Press;

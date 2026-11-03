import { Card, CardContent } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
import { mailtoLink, whatsappLink } from "@/data/contact";

const areas = ["Software development", "Community outreach", "Agricultural research", "Content creation", "School outreach"];

const Careers = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Seo title="Careers & Volunteering at AgriHubX" description="No formal openings right now. Student volunteers and interns are welcome to express interest in helping AgriHubX." path="/careers" />
    <section className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Grow With Us 🌱</h1>
      <p className="text-muted-foreground max-w-xl mx-auto">No formal openings right now — we welcome student volunteers and interns.</p>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">Areas we'd love help with</h2>
      <div className="space-y-3">
        {areas.map(area => {
          const message = `Hello AgriHubX team, I'd like to express interest in helping with ${area.toLowerCase()} as a student volunteer or intern. Please let me know whether there is an opportunity to contribute.`;
          return (
            <Card key={area}>
              <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <h3 className="font-semibold">{area}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" className="min-h-11"><a href={mailtoLink(`Interest in ${area}`, message)}><Mail />Express interest by email</a></Button>
                  <Button asChild className="min-h-11"><a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"><MessageCircle />Express interest on WhatsApp</a></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  </div>
);
export default Careers;

import { Card, CardContent } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { FileText, Mail, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, mailtoLink, whatsappLink } from "@/data/contact";

const kitRequest = "Hello AgriHubX team, please send me any available press materials, including your logo and app screenshots. Please let me know what is available.";
const Press = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Seo title="Press & Media Contact — AgriHubX" description="Journalists can contact AgriHubX with press inquiries and request available press materials." path="/press" />
    <h1 className="text-3xl font-display font-bold text-center mb-2">AgriHubX Press</h1>
    <p className="text-center text-muted-foreground mb-8">No press coverage yet. Journalists, please get in touch.</p>
    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="shadow-md"><CardContent className="p-6 text-center">
        <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
        <h2 className="font-semibold mb-1">Press Kit</h2>
        <p className="text-sm text-muted-foreground mb-3">Ask about available logos and screenshots.</p>
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="min-h-11"><a href={mailtoLink("Press kit request", kitRequest)}><Mail />Request Press Kit</a></Button>
          <Button asChild variant="outline" className="min-h-11"><a href={whatsappLink(kitRequest)} target="_blank" rel="noopener noreferrer"><MessageCircle />Request via WhatsApp</a></Button>
        </div>
      </CardContent></Card>
      <Card className="shadow-md"><CardContent className="p-6 text-center">
        <Mail className="w-8 h-8 mx-auto text-primary mb-2" />
        <h2 className="font-semibold mb-1">Media Contact</h2>
        <a href={mailtoLink("Press inquiry", "Hello AgriHubX team, I have a press inquiry: ")} className="block text-sm text-primary break-all mb-3 underline min-h-11 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{CONTACT_EMAIL}</a>
        <Button asChild variant="outline" className="min-h-11"><a href={mailtoLink("Press inquiry", "Hello AgriHubX team, I have a press inquiry: ")}>Send Press Inquiry</a></Button>
      </CardContent></Card>
    </div>
  </div>
);
export default Press;

import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappLink, mailtoLink } from "@/data/contact";

interface ContactReachProps {
  /** Message pre-filled for the buyer. */
  message: string;
  /** Subject line used when the buyer picks email. */
  emailSubject?: string;
  /** "row" sits inline on a page; "stack" is for narrow cards. */
  layout?: "row" | "stack";
  className?: string;
}

/**
 * WhatsApp / email buttons used wherever a buyer may want a human before
 * committing to an order. No sign-in required.
 */
const ContactReach = ({
  message,
  emailSubject = "Enquiry via AgriHubX",
  layout = "row",
  className,
}: ContactReachProps) => (
  <div className={cn("gap-2", layout === "row" ? "flex flex-wrap" : "flex flex-col", className)}>
    <Button asChild variant="outline" size="sm" className="gap-1.5">
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="w-4 h-4 text-primary" />
        WhatsApp us
      </a>
    </Button>
    <Button asChild variant="outline" size="sm" className="gap-1.5">
      <a href={mailtoLink(emailSubject, message)}>
        <Mail className="w-4 h-4 text-primary" />
        Email us
      </a>
    </Button>
    {layout === "stack" && (
      <p className="text-xs text-muted-foreground">
        WhatsApp {WHATSAPP_DISPLAY} · {CONTACT_EMAIL}
      </p>
    )}
  </div>
);

export default ContactReach;

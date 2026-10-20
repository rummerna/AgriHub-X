import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Clock, Instagram, MessageCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappLink, mailtoLink } from "@/data/contact";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");

  const composed = `${message || "Hi AgriHubX team,"}\n\n—\nName: ${name || "—"}\nEmail: ${email || "—"}\nPhone: ${phone || "—"}\nCategory: ${category}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Seo title="Contact AgriHubX — Email or WhatsApp Us" description="Reach the AgriHubX team on WhatsApp or email before you place an order. We reply within 24 hours." path="/contact" />
      <h1 className="text-3xl font-display font-bold text-center mb-2">Get in Touch</h1>
      <p className="text-center text-muted-foreground mb-8">Questions about a listing, delivery or payment? Message us first — no sign-in needed.</p>

      {/* Direct channels: the fastest way for a buyer to reach a human */}
      <Card className="shadow-md mb-8">
        <CardContent className="p-6">
          <p className="font-semibold text-sm mb-1">Talk to us before you order</p>
          <p className="text-sm text-muted-foreground mb-4">We'll confirm availability, quantity and delivery costs so nothing surprises you after payment.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1 gap-2" size="lg">
              <a href={whatsappLink("Hi AgriHubX! I have a question before placing an order.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2" size="lg">
              <a href={mailtoLink("Enquiry via AgriHubX", "Hi AgriHubX team,\n\n")}>
                <Mail className="w-5 h-5" />
                Email {CONTACT_EMAIL}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardContent className="p-6 space-y-4">
            <div><Label htmlFor="c-name">Name</Label><Input id="c-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
            <div><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label htmlFor="c-phone">Phone (optional)</Label><Input id="c-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." /></div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="press">Press</SelectItem>
                  <SelectItem value="school">School Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={4} /></div>
            <p className="text-xs text-muted-foreground">Your message opens in WhatsApp or your email app, so it reaches us for sure.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="flex-1 gap-1.5">
                <a href={whatsappLink(composed)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> Send by WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1 gap-1.5">
                <a href={mailtoLink(`${category} — ${name || "Website enquiry"}`, composed)}>
                  <Mail className="w-4 h-4" /> Send by Email
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardContent className="p-4 flex items-start gap-3"><MessageCircle className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">WhatsApp</p><a href={whatsappLink("Hi AgriHubX!")} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{WHATSAPP_DISPLAY}</a></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-start gap-3"><Mail className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Email</p><a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-primary hover:underline">{CONTACT_EMAIL}</a></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-start gap-3"><MapPin className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Office</p><p className="text-sm text-muted-foreground">St. John Tala High School, Tala, Machakos County, Kenya</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-start gap-3"><Clock className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Hours</p><p className="text-sm text-muted-foreground">Mon-Fri, 8am-5pm (school hours)</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-start gap-3"><Instagram className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Instagram</p><p className="text-sm text-muted-foreground">@mr.man_1.0</p></div></CardContent></Card>
          <p className="text-xs text-muted-foreground text-center">As student developers, we may take 1-2 days to respond. Thank you for your patience.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;

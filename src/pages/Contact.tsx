import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Clock, Instagram } from "lucide-react";

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-center mb-2">Get in Touch</h1>
      <p className="text-center text-muted-foreground mb-8">We'd love to hear from you</p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardContent className="p-6 space-y-4">
            <div><Label>Name</Label><Input placeholder="Your name" /></div>
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
            <div><Label>Phone (optional)</Label><Input placeholder="+254..." /></div>
            <div>
              <Label>Category</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="press">Press</SelectItem>
                  <SelectItem value="school">School Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Message</Label><Textarea placeholder="How can we help?" rows={4} /></div>
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardContent className="p-4 flex items-start gap-3"><Mail className="w-5 h-5 text-primary mt-0.5" /><div><p className="font-semibold text-sm">Email</p><p className="text-sm text-muted-foreground">rummerna@gmail.com</p></div></CardContent></Card>
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

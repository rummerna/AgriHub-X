import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  "Soil Testing", "Crop Spraying", "Transport", "Storage",
  "Consulting", "Veterinary", "Labour", "Equipment Rental", "Other"
];

const currencies = ["KES", "USD", "EUR", "GBP", "TZS", "UGX", "NGN", "GHS"];

const CreateService = () => {
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    price_type: "fixed",
    currency: "KES",
    location: "",
  });

  const handleSubmit = async () => {
    if (!supabaseUser || !form.title || !form.category) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("services").insert({
        provider_id: supabaseUser.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        price: form.price ? parseFloat(form.price) : null,
        price_type: form.price_type,
        currency: form.currency,
        location: form.location || null,
      });
      if (error) throw error;
      toast({ title: "Service listed!" });
      navigate("/services");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
      <Link to="/services"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
      <h1 className="text-2xl font-display font-bold">List a Service</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Tractor Hire for Ploughing" maxLength={80} />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {serviceCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your service..." rows={3} maxLength={500} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.price_type} onValueChange={(v) => setForm(f => ({ ...f, price_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Machakos, Kenya" />
          </div>

          <Button onClick={handleSubmit} disabled={!form.title || !form.category || submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Publish Service
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageCircle, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReviewList from "@/components/ReviewList";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const [service, setService] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("services").select("*").eq("id", id).single();
      if (data) {
        setService(data);
        const { data: profile } = await supabase.from("profiles_public" as any as 'profiles').select("*").eq("user_id", data.provider_id).single();
        setProvider(profile);
      }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  const handleContact = async () => {
    if (!supabaseUser || !service) return;
    // Find or create conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1_id.eq.${supabaseUser.id},participant_2_id.eq.${service.provider_id}),and(participant_1_id.eq.${service.provider_id},participant_2_id.eq.${supabaseUser.id})`)
      .limit(1);

    if (existing && existing.length > 0) {
      navigate(`/messages?c=${existing[0].id}`);
    } else {
      const { data: newConv } = await supabase.from("conversations").insert({
        participant_1_id: supabaseUser.id,
        participant_2_id: service.provider_id,
        last_message_text: `Inquiry about: ${service.title}`,
      }).select("id").single();
      if (newConv) {
        await supabase.from("messages").insert({
          conversation_id: newConv.id,
          sender_id: supabaseUser.id,
          message_text: `Hi! I'm interested in your service: "${service.title}"`,
        });
        navigate(`/messages?c=${newConv.id}`);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!service) return <div className="text-center py-20"><p>Service not found</p><Link to="/services"><Button variant="outline" className="mt-4">Back to Services</Button></Link></div>;

  const priceTypeLabels: Record<string, string> = { fixed: "Fixed", hourly: "Per Hour", negotiable: "Negotiable", free: "Free" };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Link to="/services"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-display font-bold">{service.title}</h1>
              <Badge variant="secondary" className="mt-1">{service.category}</Badge>
            </div>
            <div className="text-right">
              {service.price ? (
                <>
                  <p className="text-xl font-bold text-primary">{service.currency} {Number(service.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{priceTypeLabels[service.price_type] || service.price_type}</p>
                </>
              ) : (
                <Badge variant="outline">Free</Badge>
              )}
            </div>
          </div>

          {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
          {service.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{service.location}</p>
          )}

          {service.rating_count > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-semibold">{Number(service.rating_avg).toFixed(1)}</span>
              <span className="text-muted-foreground">({service.rating_count} reviews)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider card */}
      {provider && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {provider.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  {provider.full_name}
                  {provider.verified && <CheckCircle className="w-3 h-3 text-primary" />}
                </p>
                <p className="text-xs text-muted-foreground">{provider.county}, {provider.country}</p>
              </div>
            </div>
            <Button size="sm" onClick={handleContact} className="gap-1" disabled={!supabaseUser || supabaseUser.id === service.provider_id}>
              <MessageCircle className="w-3 h-3" /> Contact
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      {provider && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Provider Reviews</h3>
            <ReviewList userId={service.provider_id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceDetail;

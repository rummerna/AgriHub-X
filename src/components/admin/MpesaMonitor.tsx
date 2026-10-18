import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Health = {
  total: number; succeeded: number; failed: number; duplicates: number;
  mismatches: number; rejected: number; failure_rate: number;
};
type Alert = {
  id: string; alert_type: string; severity: string; message: string;
  created_at: string; acknowledged_at: string | null;
};
type Event = {
  id: string; outcome: string; reason: string | null; checkout_request_id: string | null;
  amount: number | null; created_at: string;
};

const db = supabase as any;

const outcomeVariant = (o: string) =>
  o === "success" ? "secondary" : o === "duplicate" ? "outline" : "destructive";

export default function MpesaMonitor() {
  const [health, setHealth] = useState<Health | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [h, a, e] = await Promise.all([
      db.rpc("mpesa_callback_health", { _minutes: 1440 }),
      db.from("mpesa_alerts").select("*").order("created_at", { ascending: false }).limit(20),
      db.from("mpesa_callback_events").select("id, outcome, reason, checkout_request_id, amount, created_at")
        .order("created_at", { ascending: false }).limit(50),
    ]);
    setHealth(h.data?.[0] ?? null);
    setAlerts(a.data ?? []);
    setEvents(e.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = db.channel("mpesa-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mpesa_alerts" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, [load]);

  const acknowledge = async (id: string) => {
    const { data: u } = await supabase.auth.getUser();
    await db.from("mpesa_alerts")
      .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: u.user?.id })
      .eq("id", id);
    load();
  };

  const open = alerts.filter((a) => !a.acknowledged_at);
  const stats = [
    { label: "Callbacks (24h)", value: health?.total ?? 0 },
    { label: "Succeeded", value: health?.succeeded ?? 0 },
    { label: "Failed", value: health?.failed ?? 0 },
    { label: "Duplicates", value: health?.duplicates ?? 0 },
    { label: "Mismatched", value: health?.mismatches ?? 0 },
    { label: "Rejected", value: health?.rejected ?? 0 },
    { label: "Problem rate", value: `${health?.failure_rate ?? 0}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">M-PESA payment monitoring</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Alerts
            {open.length > 0 && <Badge variant="destructive">{open.length} open</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> No alerts raised.
            </p>
          )}
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 border rounded-md p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={a.severity === "critical" ? "destructive" : "outline"}>{a.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm">{a.message}</p>
              </div>
              {a.acknowledged_at ? (
                <Badge variant="secondary">Acknowledged</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => acknowledge(a.id)}>Acknowledge</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent callbacks</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {events.length === 0 && <p className="text-sm text-muted-foreground">No callbacks recorded yet.</p>}
          {events.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-2 text-sm border-b last:border-0 py-1.5">
              <Badge variant={outcomeVariant(e.outcome) as any}>{e.outcome}</Badge>
              <span className="text-muted-foreground">{e.reason}</span>
              {e.amount != null && <span>KES {e.amount}</span>}
              <span className="ml-auto text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

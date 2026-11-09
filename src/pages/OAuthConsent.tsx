import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { authOAuth } from "@/lib/mcp/oauth-client";

function stringList(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? value.split(/\s+/).filter(Boolean) : [];
}

function scopeLabel(scope: string): string {
  if (scope === "openid" || scope === "profile") return "Share your basic profile";
  if (scope === "email") return "Share your email address";
  return `Additional permission requested: ${scope}`;
}

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<Awaited<ReturnType<typeof authOAuth.getAuthorizationDetails>>["data"]>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!authorizationId) {
        setError("This connection request is missing its authorization details.");
        return;
      }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError("Your sign-in could not be checked. Please try again.");
        return;
      }
      if (!sessionData.session) {
        const next = window.location.pathname + window.location.search;
        navigate(`/auth/login?next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const { data, error: detailsError } = await authOAuth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError("This connection request is invalid, expired, or could not be loaded.");
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.assign(immediate);
        return;
      }
      setAccountEmail(userData.user?.email ?? "Signed-in account");
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId, navigate]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const result = approve
      ? await authOAuth.approveAuthorization(authorizationId)
      : await authOAuth.denyAuthorization(authorizationId);
    if (result.error) {
      setError(approve ? "Approval could not be completed. Please retry or cancel the connection." : "The connection could not be cancelled. Please retry.");
      setBusy(false);
      return;
    }
    const target = result.data?.redirect_url ?? result.data?.redirect_to;
    if (!target) {
      setError("The connection service did not provide a return address. Please retry.");
      setBusy(false);
      return;
    }
    window.location.assign(target);
  }

  const clientName = details?.client?.name ?? details?.client_name ?? "an external app";
  const scopes = stringList(details?.requested_scopes ?? details?.scopes ?? details?.scope);

  return (
    <main className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="font-display text-2xl">Connect {clientName} to AgriHub-X</CardTitle>
          <p className="text-sm text-muted-foreground">{clientName} will be able to call this app’s enabled tools while you are signed in.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <Alert variant="destructive"><AlertTitle>Connection needs attention</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {!details && !error ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" />Loading connection request…</div>
          ) : details ? (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Signed-in account</p>
                <p className="font-medium break-all">{accountEmail}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Connecting app</p>
                <p className="font-medium">{clientName}</p>
                {details.redirect_uri && <p className="text-sm text-muted-foreground break-all">Return address: {details.redirect_uri}</p>}
              </div>
              <p className="text-sm">This lets {clientName} use AgriHub-X as you.</p>
              {scopes.length > 0 && <ul className="space-y-2 text-sm">{scopes.map((scope) => <li key={scope} className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-primary" />{scopeLabel(scope)}</li>)}</ul>}
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                The available marketplace, auction, and order information remains subject to your account permissions and this app’s data protections.
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" disabled={busy} onClick={() => void decide(false)}><X className="h-4 w-4" />Cancel connection</Button>
                <Button disabled={busy} onClick={() => void decide(true)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Approve</Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
};

export default OAuthConsent;
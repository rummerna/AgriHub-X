import { supabase } from "@/integrations/supabase/client";

type OAuthResult = {
  redirect_url?: string | null;
  redirect_to?: string | null;
  client?: { name?: string | null } | null;
  client_name?: string | null;
  redirect_uri?: string | null;
  requested_scopes?: string[] | string | null;
  scopes?: string[] | string | null;
  scope?: string | null;
};

type OAuthMethodResult = { data: OAuthResult | null; error: { message: string } | null };

type OAuthMethods = {
  getAuthorizationDetails: (authorizationId: string) => Promise<OAuthMethodResult>;
  approveAuthorization: (authorizationId: string) => Promise<OAuthMethodResult>;
  denyAuthorization: (authorizationId: string) => Promise<OAuthMethodResult>;
};

export const authOAuth = (supabase.auth as unknown as { oauth: OAuthMethods }).oauth;
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Server-verified admin gate: checks the user_roles table for an 'admin' role
 * (enforced by RLS/DB) before rendering admin-only UI.
 */
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (active) setState("denied");
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (active) setState(!error && data === true ? "allowed" : "denied");
    })();
    return () => { active = false; };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "denied") return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default RequireAdmin;

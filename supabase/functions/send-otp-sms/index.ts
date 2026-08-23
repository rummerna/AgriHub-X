import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hashCode(code: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication: only signed-in users may trigger or verify SMS codes ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const payload = await req.json().catch(() => ({}));
    const action = payload?.action === "verify" ? "verify" : "send";

    // ---------------- verify ----------------
    if (action === "verify") {
      const code = String(payload?.code ?? "");
      if (!/^\d{6}$/.test(code)) return json({ success: false, error: "Invalid code" }, 400);

      const { data: record } = await admin
        .from("phone_otp_codes")
        .select("id, code_hash, attempts, consumed, expires_at")
        .eq("user_id", user.id)
        .eq("consumed", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!record || new Date(record.expires_at) < new Date() || record.attempts >= 5) {
        return json({ success: false, error: "Code expired or invalid" }, 400);
      }

      const candidate = await hashCode(code, record.id);
      if (candidate !== record.code_hash) {
        await admin
          .from("phone_otp_codes")
          .update({ attempts: record.attempts + 1 })
          .eq("id", record.id);
        return json({ success: false, error: "Code expired or invalid" }, 400);
      }

      await admin.from("phone_otp_codes").update({ consumed: true }).eq("id", record.id);
      return json({ success: true });
    }

    // ---------------- send ----------------
    const phone = String(payload?.phone ?? "");
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
      return json({ error: "Invalid phone number format. Use E.164 (e.g., +254712345678)" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!LOVABLE_API_KEY || !TWILIO_API_KEY) {
      return json({ success: false, error: "SMS not configured", fallback: "email" });
    }

    // Server-generated code — never accepted from the client
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: inserted, error: insertErr } = await admin
      .from("phone_otp_codes")
      .insert({ user_id: user.id, phone, code_hash: "pending", expires_at: expiresAt })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      console.error("Failed to store OTP:", insertErr);
      return json({ success: false, error: "Could not send code", fallback: "email" });
    }
    await admin
      .from("phone_otp_codes")
      .update({ code_hash: await hashCode(otp, inserted.id) })
      .eq("id", inserted.id);

    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER") || "+15005550006";

    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: `AgriHub-X: Your verification code is ${otp}. Valid for 10 minutes.`,
      }),
    });

    if (!response.ok) {
      console.error("Twilio SMS failed with status", response.status);
      return json({ success: false, error: "SMS delivery failed", fallback: "email" });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in send-otp-sms:", error);
    return json({ success: false, error: "Unexpected error", fallback: "email" });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const accepted = (desc = "Accepted") =>
  new Response(JSON.stringify({ ResultCode: 0, ResultDesc: desc }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Verify the callback really comes from our configured Safaricom callback URL ---
    const expectedSecret = Deno.env.get("MPESA_CALLBACK_SECRET");
    const providedSecret =
      new URL(req.url).searchParams.get("secret") ??
      req.headers.get("x-callback-secret") ??
      "";
    if (!expectedSecret || providedSecret !== expectedSecret) {
      console.warn("Rejected M-PESA callback with invalid secret");
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Rejected" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const stk = body?.Body?.stkCallback;
    const resultCode = stk?.ResultCode;
    const checkoutRequestId = stk?.CheckoutRequestID;
    const merchantRequestId = stk?.MerchantRequestID;

    if (typeof checkoutRequestId !== "string" || !/^[\w.-]{5,64}$/.test(checkoutRequestId)) {
      return accepted("Missing or malformed CheckoutRequestID");
    }


    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (resultCode !== 0) {
      console.log(`Payment failed/cancelled for ${checkoutRequestId} (code ${resultCode})`);
      return accepted();
    }

    const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item || [];
    const mpesaRef = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const amount = metadata.find((i: any) => i.Name === "Amount")?.Value;

    // Match the exact order that initiated this transaction
    const { data: order } = await supabaseClient
      .from("orders")
      .select("id, user_id, status")
      .eq("mpesa_checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (!order) {
      console.warn("No order matches CheckoutRequestID");
      return accepted();
    }

    if (order.status === "paid") {
      return accepted("Already processed");
    }

    await supabaseClient.from("orders").update({ status: "paid" }).eq("id", order.id);

    await supabaseClient.from("notifications").insert({
      user_id: order.user_id,
      type: "payment",
      message: `Payment of KES ${amount} confirmed via M-PESA. Ref: ${mpesaRef}`,
      reference_id: order.id,
    });

    return accepted();
  } catch (err) {
    console.error("Callback error:", err);
    return accepted("Error");
  }
});

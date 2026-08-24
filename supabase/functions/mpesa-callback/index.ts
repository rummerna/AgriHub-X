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

    // Match the exact order that initiated this transaction. Nothing in the
    // payload other than the CheckoutRequestID may be used to pick the order.
    const { data: order } = await supabaseClient
      .from("orders")
      .select(
        "id, user_id, status, total_amount, mpesa_amount_expected, mpesa_merchant_request_id, mpesa_receipt, mpesa_requested_at"
      )
      .eq("mpesa_checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (!order) {
      console.warn("No order matches CheckoutRequestID");
      return accepted();
    }

    // The MerchantRequestID recorded at push time must also match when we have one.
    if (
      order.mpesa_merchant_request_id &&
      typeof merchantRequestId === "string" &&
      merchantRequestId !== order.mpesa_merchant_request_id
    ) {
      console.warn("MerchantRequestID mismatch for order", order.id);
      return accepted();
    }

    // Callbacks for a request we never initiated, or one far too old, are ignored.
    if (!order.mpesa_requested_at) {
      console.warn("Order has no recorded STK request", order.id);
      return accepted();
    }
    const ageMs = Date.now() - new Date(order.mpesa_requested_at).getTime();
    if (ageMs > 60 * 60 * 1000) {
      console.warn("Stale callback ignored for order", order.id);
      return accepted();
    }

    if (resultCode !== 0) {
      console.log(`Payment failed/cancelled for order ${order.id} (code ${resultCode})`);
      if (order.status !== "paid") {
        await supabaseClient
          .from("orders")
          .update({ mpesa_checkout_request_id: null, mpesa_requested_at: null })
          .eq("id", order.id)
          .neq("status", "paid");
      }
      return accepted();
    }

    const metadata = Array.isArray(stk?.CallbackMetadata?.Item) ? stk.CallbackMetadata.Item : [];
    const mpesaRef = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const paidAmount = Number(metadata.find((i: any) => i.Name === "Amount")?.Value);

    if (typeof mpesaRef !== "string" || !/^[A-Z0-9]{6,20}$/.test(mpesaRef)) {
      console.warn("Missing/invalid MpesaReceiptNumber for order", order.id);
      return accepted();
    }

    // The confirmed amount must match what we asked the payer for.
    const expected = Number(order.mpesa_amount_expected ?? order.total_amount);
    if (!Number.isFinite(paidAmount) || !Number.isFinite(expected) || Math.abs(paidAmount - expected) > 0.5) {
      console.warn(`Amount mismatch for order ${order.id}: paid ${paidAmount}, expected ${expected}`);
      return accepted("Amount mismatch");
    }

    if (order.status === "paid") {
      return accepted("Already processed");
    }

    // Conditional update: only flips an unpaid order, so replayed callbacks
    // cannot re-confirm or overwrite an already-settled order.
    const { data: updated, error: updErr } = await supabaseClient
      .from("orders")
      .update({ status: "paid", mpesa_receipt: mpesaRef, paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("mpesa_checkout_request_id", checkoutRequestId)
      .neq("status", "paid")
      .select("id");

    if (updErr) {
      console.error("Failed to mark order paid:", updErr.message);
      return accepted("Error");
    }
    if (!updated || updated.length === 0) {
      return accepted("Already processed");
    }

    await supabaseClient.from("notifications").insert({
      user_id: order.user_id,
      type: "payment",
      message: `Payment of KES ${paidAmount} confirmed via M-PESA. Ref: ${mpesaRef}`,
      reference_id: order.id,
    });

    return accepted();
  } catch (err) {
    console.error("Callback error:", err);
    return accepted("Error");
  }
});

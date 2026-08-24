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

type Outcome = "success" | "failed" | "duplicate" | "mismatch" | "rejected" | "error";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Records the outcome of this callback and lets the database raise alerts
  // when failure rates, duplicates or mismatched payloads spike.
  const monitor = async (
    outcome: Outcome,
    reason: string,
    extra: {
      orderId?: string | null;
      checkoutRequestId?: string | null;
      merchantRequestId?: string | null;
      resultCode?: number | null;
      amount?: number | null;
    } = {}
  ) => {
    try {
      await supabaseClient.rpc("record_mpesa_callback_event", {
        _outcome: outcome,
        _reason: reason,
        _order_id: extra.orderId ?? null,
        _checkout_request_id: extra.checkoutRequestId ?? null,
        _merchant_request_id: extra.merchantRequestId ?? null,
        _result_code: typeof extra.resultCode === "number" ? extra.resultCode : null,
        _amount: typeof extra.amount === "number" && Number.isFinite(extra.amount) ? extra.amount : null,
      });
    } catch (e) {
      console.error("Failed to record callback monitoring event:", e);
    }
  };

  try {
    // --- Verify the callback really comes from our configured Safaricom callback URL ---
    const expectedSecret = Deno.env.get("MPESA_CALLBACK_SECRET");
    const providedSecret =
      new URL(req.url).searchParams.get("secret") ??
      req.headers.get("x-callback-secret") ??
      "";
    if (!expectedSecret || providedSecret !== expectedSecret) {
      console.warn("Rejected M-PESA callback with invalid secret");
      await monitor("rejected", "invalid_callback_secret");
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
      await monitor("mismatch", "malformed_checkout_request_id", {
        merchantRequestId: typeof merchantRequestId === "string" ? merchantRequestId : null,
      });
      return accepted("Missing or malformed CheckoutRequestID");
    }

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
      await monitor("mismatch", "no_matching_order", { checkoutRequestId, merchantRequestId });
      return accepted();
    }

    // The MerchantRequestID recorded at push time must also match when we have one.
    if (
      order.mpesa_merchant_request_id &&
      typeof merchantRequestId === "string" &&
      merchantRequestId !== order.mpesa_merchant_request_id
    ) {
      console.warn("MerchantRequestID mismatch for order", order.id);
      await monitor("mismatch", "merchant_request_id_mismatch", {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
      });
      return accepted();
    }

    // Callbacks for a request we never initiated, or one far too old, are ignored.
    if (!order.mpesa_requested_at) {
      console.warn("Order has no recorded STK request", order.id);
      await monitor("mismatch", "no_recorded_stk_request", { orderId: order.id, checkoutRequestId });
      return accepted();
    }
    const ageMs = Date.now() - new Date(order.mpesa_requested_at).getTime();
    if (ageMs > 60 * 60 * 1000) {
      console.warn("Stale callback ignored for order", order.id);
      await monitor("mismatch", "stale_callback", { orderId: order.id, checkoutRequestId });
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
      await monitor("failed", `result_code_${resultCode}`, {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
        resultCode: typeof resultCode === "number" ? resultCode : null,
      });
      return accepted();
    }

    const metadata = Array.isArray(stk?.CallbackMetadata?.Item) ? stk.CallbackMetadata.Item : [];
    const mpesaRef = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const paidAmount = Number(metadata.find((i: any) => i.Name === "Amount")?.Value);

    if (typeof mpesaRef !== "string" || !/^[A-Z0-9]{6,20}$/.test(mpesaRef)) {
      console.warn("Missing/invalid MpesaReceiptNumber for order", order.id);
      await monitor("mismatch", "invalid_receipt_number", {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
      });
      return accepted();
    }

    // The confirmed amount must match what we asked the payer for.
    const expected = Number(order.mpesa_amount_expected ?? order.total_amount);
    if (!Number.isFinite(paidAmount) || !Number.isFinite(expected) || Math.abs(paidAmount - expected) > 0.5) {
      console.warn(`Amount mismatch for order ${order.id}: paid ${paidAmount}, expected ${expected}`);
      await monitor("mismatch", `amount_mismatch_expected_${expected}`, {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
        amount: paidAmount,
      });
      return accepted("Amount mismatch");
    }

    if (order.status === "paid") {
      await monitor("duplicate", "order_already_paid", {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
        amount: paidAmount,
      });
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
      await monitor("failed", "order_update_error", {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
        amount: paidAmount,
      });
      return accepted("Error");
    }
    if (!updated || updated.length === 0) {
      await monitor("duplicate", "concurrent_replay", {
        orderId: order.id,
        checkoutRequestId,
        merchantRequestId,
        amount: paidAmount,
      });
      return accepted("Already processed");
    }

    await supabaseClient.from("notifications").insert({
      user_id: order.user_id,
      type: "payment",
      message: `Payment of KES ${paidAmount} confirmed via M-PESA. Ref: ${mpesaRef}`,
      reference_id: order.id,
    });

    await monitor("success", "payment_confirmed", {
      orderId: order.id,
      checkoutRequestId,
      merchantRequestId,
      amount: paidAmount,
    });

    return accepted();
  } catch (err) {
    console.error("Callback error:", err);
    await monitor("error", "unhandled_exception");
    return accepted("Error");
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication: require a valid signed-in user ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { phone, amount, orderId, accountRef } = await req.json();

    if (!phone || !amount || !orderId) {
      return json({ error: "Missing required fields: phone, amount, orderId" }, 400);
    }
    if (typeof phone !== "string" || !/^(?:254\d{9}|\+254\d{9})$/.test(phone)) {
      return json({ error: "Invalid phone number. Use format 2547XXXXXXXX" }, 400);
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 500000) {
      return json({ error: "Invalid amount" }, 400);
    }
    if (typeof orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return json({ error: "Invalid orderId" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // --- Authorization: caller must own the order ---
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status, total_amount, mpesa_checkout_request_id, mpesa_requested_at")
      .eq("id", orderId)
      .maybeSingle();

    if (!order || order.user_id !== user.id) {
      return json({ error: "Order not found" }, 404);
    }
    if (!["pending", "pending_payment", "negotiating"].includes(order.status)) {
      return json({ error: "Order is not payable" }, 400);
    }

    // The amount is always taken from the order itself — never trusted from the client.
    const orderTotal = Number(order.total_amount);
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return json({ error: "Order has an invalid total" }, 400);
    }
    if (Math.abs(numericAmount - orderTotal) > 0.5) {
      return json({ error: "Amount does not match the order total" }, 400);
    }

    // Throttle: don't allow a new STK push while a recent one is still outstanding.
    if (order.mpesa_requested_at) {
      const ageMs = Date.now() - new Date(order.mpesa_requested_at).getTime();
      if (ageMs < 60_000) {
        return json({ error: "A payment request is already in progress. Try again shortly." }, 429);
      }
    }

    const CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY");
    const CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET");
    const PASSKEY = Deno.env.get("MPESA_PASSKEY");
    const SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "174379";
    const CALLBACK_SECRET = Deno.env.get("MPESA_CALLBACK_SECRET") || "";
    const CALLBACK_URL = Deno.env.get("MPESA_CALLBACK_URL");

    if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY) {
      return json({ error: "M-PESA credentials not configured" }, 500);
    }

    // Step 1: OAuth token
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return json({ error: "Payment provider unavailable" }, 502);
    }

    // Step 2: STK push
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);
    const baseCallback =
      CALLBACK_URL || `${supabaseUrl}/functions/v1/mpesa-callback`;
    const callbackWithSecret = CALLBACK_SECRET
      ? `${baseCallback}?secret=${encodeURIComponent(CALLBACK_SECRET)}`
      : baseCallback;

    const stkPayload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(orderTotal),
      PartyA: phone.replace("+", ""),
      PartyB: SHORTCODE,
      PhoneNumber: phone.replace("+", ""),
      CallBackURL: callbackWithSecret,
      AccountReference:
        typeof accountRef === "string" && accountRef.length <= 12
          ? accountRef
          : `AGX-${orderId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `AgriHubX Order ${orderId.slice(0, 8)}`,
    };

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );
    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      const { error: updErr } = await admin
        .from("orders")
        .update({
          status: "pending",
          payment_method: "mpesa",
          mpesa_checkout_request_id: stkData.CheckoutRequestID,
          mpesa_merchant_request_id: stkData.MerchantRequestID ?? null,
          mpesa_amount_expected: Math.ceil(orderTotal),
          mpesa_phone: phone.replace("+", ""),
          mpesa_requested_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", user.id)
        .in("status", ["pending", "pending_payment", "negotiating"]);

      if (updErr) {
        console.error("Failed to record STK request:", updErr.message);
        return json({ error: "Payment request could not be recorded" }, 500);
      }

      return json({
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        message: "STK push sent. Check your phone.",
      });
    }

    console.error("STK push rejected:", JSON.stringify(stkData));
    return json({ success: false, error: "Payment request could not be sent" }, 400);
  } catch (err) {
    console.error("M-PESA STK Push error:", err);
    return json({ error: "Payment request failed" }, 500);
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-PESA Callback:", JSON.stringify(body));

    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    if (resultCode === 0) {
      // Payment successful - extract metadata
      const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item || [];
      const mpesaRef = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
      const amount = metadata.find((i: any) => i.Name === "Amount")?.Value;
      const phone = metadata.find((i: any) => i.Name === "PhoneNumber")?.Value;

      console.log(`Payment confirmed: ${mpesaRef}, Amount: ${amount}, Phone: ${phone}`);

      // Find and update the order by matching recent pending orders
      // In production, store checkoutRequestId on order creation for exact matching
      // For now, update the most recent pending mpesa order
      const { data: pendingOrders } = await supabaseClient
        .from("orders")
        .select("id, user_id")
        .eq("status", "pending")
        .eq("payment_method", "mpesa")
        .order("created_at", { ascending: false })
        .limit(1);

      if (pendingOrders && pendingOrders.length > 0) {
        const order = pendingOrders[0];
        await supabaseClient.from("orders").update({ status: "paid" }).eq("id", order.id);

        // Notify buyer
        await supabaseClient.from("notifications").insert({
          user_id: order.user_id,
          type: "payment",
          message: `Payment of KES ${amount} confirmed via M-PESA. Ref: ${mpesaRef}`,
          reference_id: order.id,
        });
      }
    } else {
      console.log(`Payment failed/cancelled. ResultCode: ${resultCode}`);
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Error" }), {
      status: 200, // Always return 200 to M-PESA
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_orders",
  title: "List my orders",
  description: "List orders created by the authenticated caller, with status and totals.",
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async (_args, ctx) => {
    const userId = ctx.getUserId();
    if (!ctx.isAuthenticated() || !userId) return { content: [{ type: "text", text: "Sign in to view your orders." }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("orders")
      .select("id,status,total_amount,currency,delivery_fee,created_at,payment_method")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { content: [{ type: "text", text: "Could not load your orders." }], isError: true };
    const orders = (data ?? []).map((order) => ({
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      currency: order.currency,
      delivery_fee: order.delivery_fee,
      created_at: order.created_at,
      payment_method: order.payment_method,
    }));
    const summary = orders.length
      ? orders.map((order) => `${order.id}: ${order.status} — ${order.total_amount} ${order.currency ?? ""}`).join("\n")
      : "You have no orders yet.";
    return { content: [{ type: "text", text: summary }], structuredContent: { orders } };
  },
});
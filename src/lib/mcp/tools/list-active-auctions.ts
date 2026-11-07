import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_active_auctions",
  title: "List active auctions",
  description: "List current active auctions using only public auction fields.",
  inputSchema: {},
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Sign in to view active auctions." }], isError: true };
    const now = new Date().toISOString();
    const { data, error } = await supabaseForUser(ctx)
      .from("auctions")
      .select("id,product_name,description,category,starting_bid,current_bid,currency,quantity,unit,country,county,bids_count,end_time")
      .eq("status", "active")
      .gt("end_time", now)
      .order("end_time", { ascending: true })
      .limit(30);
    if (error) return { content: [{ type: "text", text: "Could not load active auctions." }], isError: true };
    const auctions = (data ?? []).map((auction) => ({
      id: auction.id,
      product_name: auction.product_name,
      description: auction.description,
      category: auction.category,
      starting_bid: auction.starting_bid,
      current_bid: auction.current_bid,
      currency: auction.currency,
      quantity: auction.quantity,
      unit: auction.unit,
      country: auction.country,
      county: auction.county,
      bids_count: auction.bids_count,
      end_time: auction.end_time,
    }));
    const summary = auctions.length
      ? auctions.map((auction) => `${auction.id}: ${auction.product_name} — ${auction.current_bid ?? auction.starting_bid} ${auction.currency ?? ""}; ends ${auction.end_time}`).join("\n")
      : "No active auctions are available.";
    return { content: [{ type: "text", text: summary }], structuredContent: { auctions } };
  },
});
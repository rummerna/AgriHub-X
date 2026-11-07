import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const categories = ["Crops", "Livestock", "Inputs", "Equipment"] as const;

export default defineTool({
  name: "search_products",
  title: "Search marketplace products",
  description: "Find active, in-stock marketplace products, optionally by title and category.",
  inputSchema: {
    query: z.string().optional().describe("Optional text to match against product titles."),
    category: z.enum(categories).optional().describe("Optional marketplace category to filter by."),
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  handler: async ({ query, category }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Sign in to search marketplace products." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("products")
      .select("id,title,description,price,currency,category,quantity,unit,country,county")
      .eq("status", "active")
      .gt("quantity", 0)
      .order("created_at", { ascending: false })
      .limit(30);
    if (query !== undefined) request = request.ilike("title", `%${query}%`);
    if (category !== undefined) request = request.eq("category", category);
    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: "Could not search marketplace products." }], isError: true };
    const products = (data ?? []).map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      country: product.country,
      county: product.county,
    }));
    const summary = products.length
      ? products.map((product) => `${product.id}: ${product.title} — ${product.price} ${product.currency ?? ""}`).join("\n")
      : "No active in-stock products matched.";
    return { content: [{ type: "text", text: summary }], structuredContent: { products } };
  },
});
import { z } from "zod";

const requestSchema = z.object({
  _items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().positive() })).min(1).max(100),
  _payment_method: z.enum(["mpesa", "card", "paypal", "bank"]),
  _delivery_address: z.string().trim().min(1, "Enter a delivery address").max(2000),
});

export function orderRequest(items: { product_id: string; quantity: number }[], payment: string, address: string) {
  return requestSchema.parse({
    _items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
    _payment_method: payment,
    _delivery_address: address,
  });
}

export type OrderRpc = (name: "place_order", args: ReturnType<typeof orderRequest>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
export type SellerStatusRpc = (name: "seller_update_order_status", args: { _order_id: string; _status: string }) => PromiseLike<{ error: { message: string } | null }>;

export async function submitOrder(
  rpc: OrderRpc,
  items: { product_id: string; quantity: number }[], payment: string, address: string,
): Promise<string[]> {
  const { data, error } = await rpc("place_order", orderRequest(items, payment, address));
  if (error) throw new Error(error.message);
  if (!Array.isArray(data) || !data.length || !data.every(id => typeof id === "string")) {
    throw new Error("Order confirmation was not received. Check My Orders before trying again.");
  }
  return data;
}

export const canBuyerCancel = (status: string) => ["pending", "pending_payment", "negotiating"].includes(status);
export function sellerTransitions(status: string): string[] {
  const next: Record<string, string> = { pending: "processing", processing: "shipped", shipped: "delivered" };
  return [...(next[status] ? [next[status]] : []), ...(["pending", "pending_payment", "negotiating", "paid", "processing"].includes(status) ? ["cancelled"] : [])];
}
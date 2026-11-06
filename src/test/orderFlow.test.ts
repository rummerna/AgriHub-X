import { describe, it, expect, vi } from "vitest";
import { orderRequest, submitOrder, canBuyerCancel, sellerTransitions } from "@/lib/orderFlow";
import { generateOtp, otpInsertFailure } from "../../supabase/functions/send-otp-sms/code";

const pid = "5cf9b9ac-66ca-40d9-889c-4a44cec23d7b";

describe("orderRequest", () => {
  it("sends only product id and quantity, never prices", () => {
    const r = orderRequest([{ product_id: pid, quantity: 2, price: 1 } as never], "mpesa", " Tala ");
    expect(r._items).toEqual([{ product_id: pid, quantity: 2 }]);
    expect(r._delivery_address).toBe("Tala");
  });
  it("rejects zero quantity, unknown payment and empty address", () => {
    expect(() => orderRequest([{ product_id: pid, quantity: 0 }], "mpesa", "x")).toThrow();
    expect(() => orderRequest([{ product_id: pid, quantity: 1 }], "cash", "x")).toThrow();
    expect(() => orderRequest([{ product_id: pid, quantity: 1 }], "mpesa", "  ")).toThrow();
  });
});

describe("submitOrder", () => {
  it("returns server order ids", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: ["a", "b"], error: null });
    await expect(submitOrder(rpc, [{ product_id: pid, quantity: 1 }], "card", "x")).resolves.toEqual(["a", "b"]);
    expect(rpc).toHaveBeenCalledWith("place_order", expect.objectContaining({ _payment_method: "card" }));
  });
  it("surfaces the real server error", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "Insufficient stock for Maize" } });
    await expect(submitOrder(rpc, [{ product_id: pid, quantity: 1 }], "card", "x")).rejects.toThrow("Insufficient stock for Maize");
  });
  it("rejects an empty confirmation", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await expect(submitOrder(rpc, [{ product_id: pid, quantity: 1 }], "card", "x")).rejects.toThrow(/confirmation/);
  });
});

describe("status rules", () => {
  it("buyer cancels only pending/pending_payment/negotiating", () => {
    expect(["pending", "pending_payment", "negotiating"].every(canBuyerCancel)).toBe(true);
    expect(canBuyerCancel("paid")).toBe(false);
    expect(canBuyerCancel("shipped")).toBe(false);
  });
  it("seller transitions follow pending→processing→shipped→delivered, cancel before shipping", () => {
    expect(sellerTransitions("pending")).toEqual(["processing", "cancelled"]);
    expect(sellerTransitions("processing")).toEqual(["shipped", "cancelled"]);
    expect(sellerTransitions("shipped")).toEqual(["delivered"]);
    expect(sellerTransitions("delivered")).toEqual([]);
  });
});

describe("OTP", () => {
  it("is 6 digits from crypto.getRandomValues", () => {
    const spy = vi.spyOn(crypto, "getRandomValues");
    for (let i = 0; i < 500; i++) expect(generateOtp()).toMatch(/^[1-9]\d{5}$/);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
  it("does not use Math.random", () => {
    const spy = vi.spyOn(Math, "random");
    generateOtp();
    expect(spy).not.toHaveBeenCalled();
  });
  it("maps the rate-limit error to 429 with the friendly message", () => {
    const r = otpInsertFailure({ code: "P0001", message: "You have requested 3 codes this hour." });
    expect(r.status).toBe(429);
    expect(r.body.error).toBe("You have requested 3 codes this hour.");
  });
  it("maps other failures to 503", () => {
    expect(otpInsertFailure({ code: "23505" }).status).toBe(503);
    expect(otpInsertFailure(null).status).toBe(503);
  });
});

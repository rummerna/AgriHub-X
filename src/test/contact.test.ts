import { describe, it, expect } from "vitest";
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  whatsappLink,
  mailtoLink,
} from "@/data/contact";

describe("buyer contact channels", () => {
  it("builds a WhatsApp click-to-chat link from digits only", () => {
    const link = whatsappLink('Hello "AgriHubX" team');
    expect(link.startsWith("https://wa.me/254710158818?text=")).toBe(true);
    // wa.me refuses "+" and spaces in the number, so neither may appear here.
    expect(link.slice(0, link.indexOf("?"))).not.toMatch(/[+\s]/);
    expect(link).toContain("Hello%20%22AgriHubX%22%20team");
  });

  it("shows the number in readable international form", () => {
    expect(WHATSAPP_DISPLAY).toBe("+254 710 158 818");
  });

  it("builds a mailto link to the support inbox with encoded subject and body", () => {
    const link = mailtoLink("Order question", "Two items please");
    expect(link.startsWith(`mailto:${CONTACT_EMAIL}?subject=`)).toBe(true);
    expect(link).toContain("subject=Order%20question");
    expect(link).toContain("body=Two%20items%20please");
  });
});

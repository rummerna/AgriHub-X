import { describe, expect, it } from "vitest";
import { blogPosts, filterArticles, isValidSubscriptionEmail, SUBSCRIPTION_SUBJECT } from "@/data/publicContent";
import { faqCount, filterFaqs, supportFaqs } from "@/data/supportFaqs";
import { mailtoLink } from "@/data/contact";

describe("public article filtering", () => {
  const articles = [{ title: "Crop notes", category: "Soil", excerpt: "Water safely" }, { title: "Privacy", category: "Account", excerpt: "County selection" }];
  it("matches title, category and excerpt live, ignoring case and surrounding spaces", () => {
    expect(filterArticles(articles, " CROP ")).toEqual([articles[0]]);
    expect(filterArticles(articles, "soil")).toEqual([articles[0]]);
    expect(filterArticles(articles, "county")).toEqual([articles[1]]);
    expect(filterArticles(articles, "nonexistent")).toEqual([]);
    expect(filterArticles(blogPosts, "")).toHaveLength(2);
  });
});
describe("subscription requests", () => {
  it("rejects invalid emails before preparing a request", () => {
    expect(isValidSubscriptionEmail("")).toBe(false);
    expect(isValidSubscriptionEmail("not-an-email")).toBe(false);
    expect(isValidSubscriptionEmail("person@example.com")).toBe(true);
  });
  it("uses the requested email subject exactly", () => {
    const link = mailtoLink(SUBSCRIPTION_SUBJECT, "Please request updates");
    expect(new URLSearchParams(link.split("?")[1]).get("subject")).toBe("Subscribe me to AgriHubX updates");
  });
});
describe("help center data", () => {
  it("counts actual answers by category", () => {
    expect(faqCount("Marketplace")).toBe(4);
    expect(faqCount("Getting Started")).toBe(3);
    expect(faqCount("Privacy & Security")).toBe(2);
  });
  it("filters questions and category combinations", () => {
    expect(filterFaqs("gps").map(faq => faq.id)).toEqual(["gps"]);
    expect(filterFaqs("gps", "Marketplace")).toEqual([]);
    expect(filterFaqs("", "Community")).toHaveLength(2);
    expect(filterFaqs("")).toHaveLength(supportFaqs.length);
  });
});

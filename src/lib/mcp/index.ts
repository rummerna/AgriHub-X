import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import listActiveAuctions from "./tools/list-active-auctions";
import listMyOrders from "./tools/list-my-orders";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "agrihub-x",
  title: "AgriHub-X",
  version: "0.1.0",
  instructions: "AgriHub-X tools provide signed-in access to marketplace products, active auctions, and the caller's own orders. Product and auction data is subject to app permissions; order results are limited to the signed-in account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProducts, listActiveAuctions, listMyOrders],
});
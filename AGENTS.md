# AGENTS.md

## Rules

- Buyer contact details (email, WhatsApp number) are defined only in `src/data/contact.ts`, and screens reach buyers through its `whatsappLink` / `mailtoLink` helpers or the shared `ContactReach` component. Why: the same channels appear on the Contact page, product listings and checkout, so a number change must be one edit and WhatsApp links must never carry a "+" or spaces.

- Public articles and help answers live in shared data modules; search and category counts derive from those records. Why: visible help controls and counts must describe the same real content.
- Mount the route scroll-reset component inside BrowserRouter above Routes. Why: app, auth and fallback destinations all need the same navigation scroll behavior.
- Orders are created only through authenticated place_order; status changes use guarded buyer updates or seller_update_order_status. Why: transaction pricing, stock locks and trust fields must not depend on the client.
- Auction clients use the explicit public column list and the seller-authorized reserve RPC; bid mutations are trigger-owned. Why: reserves stay private and concurrent bids stay atomic.
- Auction Realtime uses identifier-only auction_changes signals followed by public-column refetches. Why: publishing a reserve-bearing row conflicts with restricted column grants.
- OTP insert limits are enforced under database advisory locks on user and phone identities. Why: concurrent function requests must not evade timestamp-based limits.
- Conversation deletion uses participant-specific flags, and message updates are read-receipt-only. Why: one participant cannot destroy or rewrite the other participant's history.

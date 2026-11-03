# AGENTS.md

## Rules

- Buyer contact details (email, WhatsApp number) are defined only in `src/data/contact.ts`, and screens reach buyers through its `whatsappLink` / `mailtoLink` helpers or the shared `ContactReach` component. Why: the same channels appear on the Contact page, product listings and checkout, so a number change must be one edit and WhatsApp links must never carry a "+" or spaces.

- Public articles and help answers live in shared data modules; search and category counts derive from those records. Why: visible help controls and counts must describe the same real content.
- Mount the route scroll-reset component inside BrowserRouter above Routes. Why: app, auth and fallback destinations all need the same navigation scroll behavior.

# AGENTS.md

## Rules

- Buyer contact details (email, WhatsApp number) are defined only in `src/data/contact.ts`, and screens reach buyers through its `whatsappLink` / `mailtoLink` helpers or the shared `ContactReach` component. Why: the same channels appear on the Contact page, product listings and checkout, so a number change must be one edit and WhatsApp links must never carry a "+" or spaces.

// Single source of truth for the channels buyers use to reach us.
// wa.me links only open when the number is international format with the
// leading "+" removed and no spaces, so the raw digits are kept separate
// from the version shown to people.
export const CONTACT_EMAIL = "rummerna@gmail.com";

export const WHATSAPP_DISPLAY = "+254 710 158 818";

const WHATSAPP_INTL_DIGITS = "254710158818";

/** Click-to-chat link that opens WhatsApp with the message already typed. */
export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_INTL_DIGITS}?text=${encodeURIComponent(message)}`;

/** Opens the buyer's mail app with subject and body filled in. */
export const mailtoLink = (subject: string, body: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

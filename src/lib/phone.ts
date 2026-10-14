/**
 * Somali phone normalization.
 * Valid output: 252 followed by 9 digits (E.164 without "+").
 */
export function normalizeSomaliPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/[^\d]/g, "");
  if (!d) return null;
  if (d.startsWith("00252")) d = d.slice(2);
  if (d.startsWith("252")) {
    // keep
  } else if (d.startsWith("0")) {
    d = "252" + d.replace(/^0+/, "");
  } else if (d.length === 9) {
    d = "252" + d;
  }
  if (!/^252\d{9}$/.test(d)) return null;
  return d;
}

/** "252612345678" -> "+252 61 234 5678" */
export function displayPhone(normalized: string | null | undefined): string {
  if (!normalized) return "—";
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(
    5,
    8,
  )} ${normalized.slice(8)}`;
}

/**
 * Build a wa.me deep link with a correctly percent-encoded message.
 * Opens the WhatsApp app on mobile, or WhatsApp Web on desktop.
 * NOTE: clicking this only OPENS WhatsApp with the message pre-filled.
 * It never sends/delivers anything by itself, and the UI must say so.
 */
export function waMeLink(normalizedDigits: string, message: string): string {
  return `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Explicit WhatsApp WEB link (web.whatsapp.com/send).
 * Useful when wa.me is blocked (e.g. inside some in-app browsers) —
 * this always opens the browser-based composer on any device.
 */
export function waWebLink(normalizedDigits: string, message: string): string {
  return `https://web.whatsapp.com/send?phone=${normalizedDigits}&text=${encodeURIComponent(
    message,
  )}`;
}

/**
 * Native SMS deep link. Opens the phone's messages app with the body
 * pre-filled (`?&body=` form works on both Android and iOS).
 * Again: the user presses send, nothing is sent programmatically.
 */
export function smsLink(normalizedDigits: string, message: string): string {
  return `sms:+${normalizedDigits}?&body=${encodeURIComponent(message)}`;
}

export function telLink(normalizedDigits: string): string {
  return `tel:+${normalizedDigits}`;
}

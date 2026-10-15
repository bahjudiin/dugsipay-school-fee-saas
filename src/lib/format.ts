/** Formatting helpers kept framework-free so they work on server and client. */
const moneyCache = new Map<string, string>();
const monthsElapsedCache = new Map<string, number>();

export function money(amount: number | string, currency: string): string {
  const key = `${amount}-${currency}`;
  if (moneyCache.has(key)) return moneyCache.get(key)!;
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) {
    moneyCache.set(key, `—`);
    return `—`;
  }
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
    }).format(n);
    moneyCache.set(key, formatted);
    return formatted;
  } catch {
    const fallback = `${currency} ${n.toFixed(2)}`;
    moneyCache.set(key, fallback);
    return fallback;
  }
}

export function num(amount: number | string): number {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

/** "2026-01" -> "Jan 2026" */
export function monthLabel(ym: string): string {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym || "—";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Whole months elapsed from a date up to now (inclusive of the start month). */
export function monthsElapsed(from: Date | string): number {
  const start = typeof from === "string" ? new Date(from) : new Date(from);
  // Align to the first of the month so the count is consistent when a student
  // is enrolled on any day of a month – billing always starts at month boundaries.
  const key = `${start.getFullYear()}-${start.getMonth()}`;
  if (monthsElapsedCache.has(key)) return monthsElapsedCache.get(key)!;
  const aligned = new Date(start.getFullYear(), start.getMonth(), 1);
  const now = new Date();
  const m =
    (now.getFullYear() - aligned.getFullYear()) * 12 +
    (now.getMonth() - aligned.getMonth()) +
    1;
  const result = Math.max(1, m);
  monthsElapsedCache.set(key, result);
  return result;
}

export const PAYMENT_METHODS = [
  "Cash",
  "EVC Plus",
  "Zaad",
  "eDahab",
  "Bank",
  "Other",
] as const;

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "SOS", label: "SOS — Somali Shilling" },
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "ETB", label: "ETB — Ethiopian Birr" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
] as const;

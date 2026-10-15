/**
 * ============================================================
 *  DugsiPAY PRICING & SALES CONFIG — the ONLY file to edit
 *  when prices, plans or the sales contact change.
 * ============================================================
 * Prices are in USD. `price` is the RECURRING subscription fee
 * (monthly/annual) or the one-time license price (lifetime).
 * `setupFee` is ALWAYS a separate one-time onboarding charge.
 */

export const SALES = {
  /** Sales WhatsApp — used for plan inquiries. Digits only, intl format.
   *  Can also be set via NEXT_PUBLIC_SALES_WHATSAPP env var. */
  whatsapp:
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SALES_WHATSAPP) ||
    "252612345678",
  displayPhone: "+252 61 234 5678",
} as const;

export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: string; // "/month", "/year", "one-time"
  setupFee: number;
  priceNote: string; // explains the recurring vs one-time nature
  tagline: string;
  popular?: boolean;
  saveNote?: string;
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 15,
    interval: "/month",
    setupFee: 40,
    priceNote: "Billed every month. Cancel anytime.",
    tagline: "Start small, stay flexible",
  },
  {
    id: "annual",
    name: "Annual",
    price: 150,
    interval: "/year",
    setupFee: 40,
    priceNote: "Billed once a year — 2 months free vs monthly.",
    tagline: "Best for most schools",
    popular: true,
    saveNote: "Save 17%",
  },
  {
    id: "lifetime",
    name: "Lifetime license",
    price: 299,
    interval: "one-time",
    setupFee: 75,
    priceNote: "One payment for a perpetual software license.",
    tagline: "Own the software forever",
  },
];

/** Features included in every plan. */
export const PLAN_FEATURES: string[] = [
  "Unlimited students, classes & payments",
  "Bulk CSV import with duplicate detection",
  "Numbered receipts — print, PDF & share",
  "WhatsApp & SMS fee reminders (+252 auto-format)",
  "Monthly reports, balances & collection rate",
  "Activity log, safe deletes & JSON backups",
  "English / Somali interface",
  "Hosting, updates & standard support",
];

/** What the one-time setup fee covers. */
export const SETUP_INCLUDES: string[] = [
  "White-glove onboarding over WhatsApp",
  "Your student register imported for you",
  "School profile, classes & fees configured",
  "Staff walkthrough (≈45 min training call)",
];

/** Mandatory honesty note for the lifetime plan. */
export const LIFETIME_DISCLAIMER =
  "“Lifetime” means a perpetual software usage license for the DugsiPAY application. " +
  "It does NOT include free lifetime hosting, maintenance, backups or unlimited support — " +
  "after the first year those continue as an optional annual service, so your school keeps " +
  "a fast, backed-up, up-to-date system.";

export function planById(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}

/** Message sent to sales when a school picks a plan. */
export function planInquiryMessage(plan: Plan, schoolName?: string): string {
  return [
    `Salaam! I'd like to subscribe to DugsiPAY.`,
    ``,
    `Plan: ${plan.name} — $${plan.price}${plan.interval}`,
    `One-time setup: $${plan.setupFee}`,
    `Total to start: $${plan.price + plan.setupFee}`,
    schoolName ? `School: ${schoolName}` : ``,
    ``,
    `Please help me get started. Mahadsanid!`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");
}

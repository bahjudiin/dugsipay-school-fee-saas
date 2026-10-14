import { ArrowRight, BadgeDollarSign, Check, Info, MessageCircle } from "lucide-react";
import ContactMenu from "@/components/ContactMenu";
import { cn } from "@/components/ui";
import {
  LIFETIME_DISCLAIMER,
  PLANS,
  PLAN_FEATURES,
  SALES,
  SETUP_INCLUDES,
  planInquiryMessage,
} from "@/lib/pricing";
import { smsLink, waMeLink } from "@/lib/phone";

export default function PricingSection() {
  return (
    <div>
      {/* Plan cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const totalToStart = plan.price + plan.setupFee;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6",
                plan.popular
                  ? "border-aqua-500 shadow-[0_10px_36px_-14px_rgba(46,196,182,0.45)]"
                  : "border-slate-200 shadow-[0_1px_2px_rgba(29,53,87,0.05)]",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-5 rounded-full bg-aqua-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  Most popular{plan.saveNote ? ` · ${plan.saveNote}` : ""}
                </span>
              )}
              <h3 className="text-base font-bold text-slate-950">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-slate-950">${plan.price}</span>
                <span className="text-sm font-medium text-slate-500">{plan.interval}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{plan.priceNote}</p>

              {/* Setup fee — clearly separated from the subscription */}
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 ring-1 ring-primary-100">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                  <BadgeDollarSign className="size-4" /> One-time setup fee
                </span>
                <span className="text-sm font-bold text-primary-700">+${plan.setupFee}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Total to start: <span className="font-semibold text-slate-600">${totalToStart}</span>{" "}
                ({plan.interval === "one-time" ? "license + setup" : `first ${plan.interval.replace("/", "")} + setup`})
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={`/?plan=${plan.id}`}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition",
                    plan.popular
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
                  )}
                >
                  Choose {plan.name} <ArrowRight className="size-4" />
                </a>
                <ContactMenu
                  phone={SALES.whatsapp}
                  message={planInquiryMessage(plan)}
                  label="Ask on WhatsApp / SMS"
                />
              </div>

              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[13px] leading-relaxed text-slate-600">
                {PLAN_FEATURES.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-aqua-600" />
                    {f}
                  </li>
                ))}
                <li className="text-xs text-slate-400">+ everything else in the full feature list below</li>
              </ul>
            </div>
          );
        })}
      </div>

      {/* What's included everywhere */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-950">Included in every plan</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-aqua-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-950">The one-time setup covers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {SETUP_INCLUDES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary-500" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-200">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {LIFETIME_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Honest checkout note */}
      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <MessageCircle className="mt-0.5 size-3.5 shrink-0" />
        Online card checkout isn’t enabled yet — plan selection opens a pre-filled WhatsApp or SMS
        inquiry to our team ({SALES.displayPhone}), who activates your workspace and confirms payment
        (EVC Plus, Zaad or bank). No payment happens inside the browser and nothing is simulated.
      </p>
    </div>
  );
}

/** Direct wa.me + sms quick links used on the standalone /pricing page footer. */
export function SalesQuickLinks() {
  const msg = planInquiryMessage(PLANS[1]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <a
        href={waMeLink(SALES.whatsapp, msg)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        <MessageCircle className="size-4" /> WhatsApp us
      </a>
      <a
        href={smsLink(SALES.whatsapp, msg)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Send SMS
      </a>
    </div>
  );
}

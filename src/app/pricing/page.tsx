import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import PricingSection, { SalesQuickLinks } from "@/components/marketing/PricingSection";

export const metadata = {
  title: "Pricing",
  description:
    "DuqsiPay pricing: $15/month, $150/year, or a $299 lifetime license — plus a one-time setup fee. Activate over WhatsApp.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary-600 text-white">
              <GraduationCap className="size-4.5" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-950">DugsiPAY</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
            >
              Live demo
            </Link>
            <Link
              href="/?plan=annual"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-700">Pricing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            One small subscription, one honest setup fee
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            The subscription fee covers hosting, updates and support. The one-time setup fee covers
            onboarding, your data import and training — charged once, ever. Plan selection opens a
            WhatsApp or SMS inquiry; we activate your workspace personally.
          </p>
        </div>

        <div className="mt-8">
          <PricingSection />
        </div>

        <div className="mt-10 rounded-3xl bg-[#f5f5f7] px-6 py-8 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Questions about a plan? Talk to a human.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            WhatsApp or SMS us your school name and chosen plan — we reply during Somali working
            hours and get you set up within 24 hours.
          </p>
          <div className="mt-5">
            <SalesQuickLinks />
          </div>
        </div>
      </main>
    </div>
  );
}

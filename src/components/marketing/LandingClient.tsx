"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChartColumn,
  Check,
  ChevronDown,
  GraduationCap,
  Languages,
  LogIn,
  Menu,
  MessageCircle,
  NotebookPen,
  PiggyBank,
  ReceiptText,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { COPY, interpolate, type LandingLang } from "@/lib/copy";
import { cn } from "@/components/ui";
import { SALES, PLANS } from "@/lib/pricing";
import PricingSection from "@/components/marketing/PricingSection";
import SignupForm from "@/components/SignupForm";
import {
  DashboardDesktopSnapshot,
  DashboardSnapshot,
  HeroPhoneMockup,
  PaymentModalSnapshot,
  ReceiptSnapshot,
  ReportsSnapshot,
  StudentsSnapshot,
} from "@/components/snapshots";

const FEATURE_ICONS = [Users, Wallet, MessageCircle, ChartColumn, ReceiptText, Languages] as const;
const PAIN_ICONS = [NotebookPen, PiggyBank, CalendarClock] as const;
const STEP_SNAPSHOTS = [StudentsSnapshot, PaymentModalSnapshot, DashboardSnapshot] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-700">{children}</p>
  );
}

export default function LandingClient() {
  // Read plan from URL search params on initial render
  const urlPlan = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("plan")
    : undefined;
  const plan =
    urlPlan === "monthly" || urlPlan === "annual" || urlPlan === "lifetime"
      ? (urlPlan as "monthly" | "annual" | "lifetime")
      : "annual";

  // Read lang from localStorage on initial render
  const storedLang = typeof window !== "undefined"
    ? window.localStorage.getItem("dp_lang")
    : undefined;
  const lang: LandingLang = storedLang === "en" || storedLang === "so"
    ? (storedLang as LandingLang)
    : "en";

  const [menuOpen, setMenuOpen] = useState(false);

  function switchLang() {
    if (typeof window !== "undefined") {
      const next = localStorage.getItem("dp_lang") === "en" ? "so" : "en";
      window.localStorage.setItem("dp_lang", next);
    }
  }

  const c = COPY[lang];
  const links = ["#pain", "#features", "/pricing", "#faq"];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary-800 text-white">
              <GraduationCap className="size-4.5" />
            </div>
            <div>
              <p className="text-[15px] font-bold leading-tight tracking-tight text-slate-950">DugsiPAY</p>
              <p className="text-[10px] font-medium text-slate-400">{c.nav.tagline}</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-normal text-slate-600 md:flex">
            {c.nav.links.map((l, i) =>
              links[i].startsWith("/") ? (
                <Link key={l} href={links[i]} className="transition hover:text-slate-900">{l}</Link>
              ) : (
                <a key={l} href={links[i]} className="transition hover:text-slate-900">{l}</a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={switchLang}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              aria-label="Switch language / Beddel luuqadda"
            >
              <Languages className="size-3.5" />
              {lang === "en" ? "SO" : "EN"}
            </button>
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-primary-200 bg-primary-50/70 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 sm:inline-flex"
            >
              Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            >
              Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 active:scale-[0.98]"
            >
              {c.nav.cta}
            </Link>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-600 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{c.nav.menuTitle}</p>
            <div className="flex flex-col gap-1">
              {c.nav.links.map((l, i) =>
                links[i].startsWith("/") ? (
                  <Link key={l} href={links[i]} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                    {l}
                  </Link>
                ) : (
                  <a key={l} href={links[i]} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                    {l}
                  </a>
                ),
              )}
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-primary-50 px-2 py-2 text-sm font-bold text-primary-700"
              >
                {lang === "so" ? "Demo toos ah (Live Demo)" : "Live Demo (No Login)"}
              </Link>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 py-2.5 text-center text-sm font-bold text-slate-700">
                  <LogIn className="size-3.5" /> Live Demo
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-1 rounded-xl bg-primary-600 py-2.5 text-center text-sm font-bold text-white">
                  <UserPlus className="size-3.5" /> {c.nav.cta}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero (AIDA) ---------- */}
      <section className="border-b border-slate-100 bg-[#f5f5f7]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-2 lg:pb-20 lg:pt-14">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-aqua-50 px-3 py-1 text-xs font-semibold text-aqua-700 ring-1 ring-aqua-200">
              <Sparkles className="size-3.5" /> {c.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.07] tracking-[-0.02em] text-slate-900 sm:text-[52px]">
              {c.hero.title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">{c.hero.sub}</p>
            <p className="mt-3 max-w-lg text-[15px] font-semibold leading-relaxed text-slate-800">{c.hero.desire}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 active:scale-[0.98]"
              >
                {c.hero.cta1} <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {c.hero.cta2}
              </a>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
              {c.hero.trust.split(" · ").map((s, i, arr) => (
                <span key={s} className="inline-flex items-center gap-2">
                  <Check className="size-3.5 text-aqua-600" /> {s}
                  {i < arr.length - 1 && <span className="text-slate-300">·</span>}
                </span>
              ))}
            </p>
          </div>
          <HeroPhoneMockup />
        </div>
        {/* Social proof bar */}
        <div className="border-t border-slate-200/70 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-3 sm:px-6">
            {c.proof.map((s) => (
              <p key={s} className="flex items-center justify-center gap-2 text-center text-[13px] font-semibold text-slate-700">
                <Bell className="hidden size-3.5 text-aqua-600 sm:block" />{s}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Problem (PAS) ---------- */}
      <section id="pain" className="scroll-mt-20 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>{c.problem.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.problem.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{c.problem.sub}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.problem.cards.map((p, i) => {
              const Icon = PAIN_ICONS[i];
              return (
                <div key={p.title} className="rounded-[18px] border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold leading-snug text-slate-950">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Agitate: the cost calculator ---------- */}
      <section className="border-y border-slate-100 bg-[#f5f5f7] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>{c.agitate.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.agitate.headline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{c.agitate.sub}</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[18px] border border-danger-100 bg-danger-50/50 p-5 sm:p-6">
              <p className="text-sm font-bold text-danger-600">{c.agitate.withoutLabel}</p>
              <ul className="mt-3 space-y-2.5">
                {c.agitate.without.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <X className="mt-0.5 size-4 shrink-0 text-danger-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[18px] border border-aqua-200 bg-aqua-50/60 p-5 sm:p-6">
              <p className="text-sm font-bold text-aqua-700">{c.agitate.withLabel}</p>
              <ul className="mt-3 space-y-2.5">
                {c.agitate.with.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-aqua-600" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 rounded-[18px] bg-primary-800 px-6 py-5 text-center">
            <p className="text-base font-semibold leading-relaxed text-white sm:text-lg">{c.agitate.roi}</p>
            <p className="mt-1.5 text-[13px] font-medium text-aqua-300">{c.agitate.onePercent}</p>
          </div>
        </div>
      </section>

      {/* ---------- Solution (BAB) ---------- */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Eyebrow>{c.solution.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.solution.headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{c.solution.sub}</p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {c.solution.values.map((v) => (
              <div key={v} className="rounded-[18px] border border-slate-200 bg-white p-5">
                <Check className="size-5 text-aqua-600" />
                <p className="mt-2.5 text-sm font-semibold leading-relaxed text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features (FAB) + desktop snapshot ---------- */}
      <section id="features" className="scroll-mt-20 border-t border-slate-100 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>{c.features.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.features.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{c.features.sub}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.features.cards.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="rounded-[18px] border border-slate-200 bg-white p-5">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold text-slate-950">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
                  <p className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-aqua-700">
                    <Check className="mt-0.5 size-3.5 shrink-0" /> {f.proof}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-10 text-center text-sm font-bold text-slate-900">{c.features.snapshotLabel}</p>
          <div className="mt-4 flex justify-center overflow-x-auto pb-2">
            <DashboardDesktopSnapshot />
          </div>
        </div>
      </section>

      {/* ---------- How it works (BAB) + step snapshots ---------- */}
      <section id="how" className="scroll-mt-20 border-t border-slate-100 bg-[#f5f5f7] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.steps.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{c.steps.sub}</p>
          </div>
          <div className="mt-10 space-y-10">
            {c.steps.items.map((s, i) => {
              const Snap = STEP_SNAPSHOTS[i];
              return (
                <div key={s.title} className={cn("grid items-center gap-6 lg:grid-cols-2", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
                  <div>
                    <span className="font-mono text-4xl font-bold text-slate-200">0{i + 1}</span>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{s.body}</p>
                  </div>
                  <div className="flex justify-center">
                    <Snap />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-10 max-w-xl rounded-[18px] border border-aqua-200 bg-aqua-50 px-5 py-3.5 text-center text-sm font-semibold text-aqua-800">
            {c.steps.ttv}
          </p>
        </div>
      </section>

      {/* ---------- Testimonials (placeholder) + receipts/reports snapshots ---------- */}
      <section className="border-t border-slate-100 py-14 sm:py-20">
        {/* PLACEHOLDER TESTIMONIALS — REPLACE WITH REAL QUOTES */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.testimonials.title}</h2>
            <p className="mt-2 text-xs font-medium text-slate-400">{c.testimonials.sub}</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {c.testimonials.items.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-[18px] border border-slate-200 bg-white p-5">
                <blockquote className="text-sm leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <span className="mt-2 inline-flex rounded-full bg-aqua-50 px-2.5 py-1 text-[11px] font-bold text-aqua-700 ring-1 ring-aqua-200">
                    {t.badge}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 grid items-start justify-center gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center">
              <ReceiptSnapshot />
              <p className="mt-3 max-w-xs text-center text-xs font-medium text-slate-500">{c.testimonials.receiptsCaption}</p>
            </div>
            <div className="flex flex-col items-center">
              <ReportsSnapshot />
              <p className="mt-3 max-w-xs text-center text-xs font-medium text-slate-500">{c.testimonials.reportsCaption}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="scroll-mt-20 border-t border-slate-100 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>{lang === "so" ? "Qiimaha" : "Pricing"}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">
              {lang === "so" ? "Maalgashi maalmeed, qiimo yar" : "An investment that pays for itself weekly"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {lang === "so"
                ? `Lacagta bisha waxay ku bilowdaa $${PLANS[0].price} — la noqoshadii hore ayaad illaa rabaan kartaa. Kaarka ma lama baahna; WhatsApp ayaan kaa soo dejinaa.`
                : `Plans start at $${PLANS[0].price}/month — you can cancel anytime, and we do your setup over WhatsApp. The subscription covers hosting, updates and support; the one-time setup covers onboarding, data import and training.`}
            </p>
          </div>
          <div className="mt-8">
            <PricingSection />
          </div>
          <p className="mt-5 text-center text-xs font-semibold text-slate-500">
            {lang === "so"
              ? `Iyadoo $${PLANS[0].price}/bishii ka bilaabanto, taasi waa ka yar 1% dakhligaaga bisha ee lacagaha — haraaga ugu yar wuu ku soo celiyaa.`
              : `From $${PLANS[0].price}/month, that's less than 1% of a $3,000/month school's fee revenue — one recovered balance pays for the whole year.`}
          </p>
        </div>
      </section>

      {/* ---------- FAQ (objection handling) ---------- */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-100 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">{c.faq.title}</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-[18px] border border-slate-200 bg-white">
            {c.faq.items.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA (PAS + 4Ps push) ---------- */}
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-primary-800 px-6 py-12 text-center sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-300">{c.finalCta.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">{c.finalCta.headline}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-100 sm:text-base">{c.finalCta.sub}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-aqua-50 active:scale-[0.98]"
            >
              {c.finalCta.cta} <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=252617673669&type=phone_number&app_absent=0&text=Salaam!%20I%27d%20like%20to%20know%20more%20about%20DuqsiPay."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <MessageCircle className="size-4" /> {c.finalCta.waCta}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {c.finalCta.badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-100">
                <Check className="size-3.5 text-aqua-300" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Signup ---------- */}
      <section id="signup" className="scroll-mt-20 border-t border-slate-100 bg-[#f5f5f7] py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <Eyebrow>{lang === "so" ? "Bilow hadda" : "Get started"}</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">
              {lang === "so" ? "Isdiiwaangeli dugsigaaga maanta." : "Register your school today."}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              {lang === "so"
                ? "Noo sheeg magaca dugsigaaga iyo lambarkaaga WhatsApp. 24 saac gudahood ayaan kaaga jawaabnaa invoice-ka iyo tallaabooyinka dejinta."
                : "Tell us your school's name and WhatsApp number. Within 24 hours we'll reply with your invoice and onboarding steps."}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {(lang === "so"
                ? ["Caawimo dejin WhatsApp — Soomaali ama English", "Diiwaankaaga waan kuu soo dejinaa haddii aad rabto", "Jooji waqti kasta — qandaraas ma jiro"]
                : ["Setup help over WhatsApp — in Somali or English", "Your register imported for you, if you want", "Cancel anytime — no contracts"]
              ).map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-aqua-600" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-[18px] border border-primary-100 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{lang === "so" ? "Marka hore ma daawan rabtaa?" : "Want to look around first?"}</p>
              <p className="mt-1 text-sm text-slate-600">
                {lang === "so" ? "Demo-ga toos ah wuxuu leeyahay dugsi tusaale ah oo buuxa. " : "The live demo has a complete sample school loaded. "}
                <Link href="/dashboard" className="font-semibold text-primary-600 hover:underline">
                  {lang === "so" ? "Fur demo-ga" : "Open the demo"} <ArrowRight className="inline size-3.5" />
                </Link>
              </p>
            </div>
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-16px_rgba(29,53,87,0.25)] sm:p-7">
            <SignupForm plan={plan} />
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary-800 text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">DuqsiPay</p>
                  <p className="text-[11px] text-slate-400">{c.footer.tagline}</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-slate-500">{c.footer.waLine}</p>
            </div>
            {c.footer.cols.map((col, ci) => {
              const FOOTER_HREFS = [
                ["/dashboard", "#features", "/pricing", "/demo"],
                ["/#pain", "/login", "/signup", "/pricing"],
                ["https://api.whatsapp.com/send?phone=252617673669&type=phone_number&app_absent=0&text=Salaam!%20I%27d%20like%20to%20know%20more%20about%20DuqsiPay.", "/#signup", "/#faq", "/dashboard"],
              ];
              return (
                <div key={col.title}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{col.title}</p>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((l, li) => {
                      const href = FOOTER_HREFS[ci]?.[li] || "/";
                      const isExternalOrAnchor = href.startsWith("#") || href.startsWith("http");
                      return (
                        <li key={l}>
                          {isExternalOrAnchor ? (
                            <a
                              href={href}
                              target={href.startsWith("http") ? "_blank" : undefined}
                              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="text-sm text-slate-600 transition hover:text-slate-900"
                            >
                              {l}
                            </a>
                          ) : (
                            <Link href={href} className="text-sm text-slate-600 transition hover:text-slate-900">
                              {l}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <p className="text-[11px] text-slate-400">{interpolate(c.footer.copyright, { year: new Date().getFullYear() })}</p>
            <div className="flex gap-4">
              {c.footer.legal.map((l) => (
                <a key={l} href="#faq" className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600">{l}</a>
              ))}
              <a
                href="https://api.whatsapp.com/send?phone=252617673669&type=phone_number&app_absent=0&text=Salaam!%20I%27d%20like%20to%20know%20more%20about%20DuqsiPay."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                title="WhatsApp us directly"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3h5v-3a5 5 0 0 0-5-5h-3v-2a3 3 0 0 1 3-3h3v2z" />
                  <circle cx="11" cy="18" r="4" />
                </svg>
                WhatsApp
              </a>
            </div>
            <div className="flex gap-4">
              {c.footer.legal.map((l) => (
                <a key={l} href="#faq" className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600">{l}</a>
              ))}
              <a
                href="mailto:bahjudiin1@gmail.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                title="Email us"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


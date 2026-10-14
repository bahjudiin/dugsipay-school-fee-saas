"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { submitSignup } from "@/lib/actions/signup";
import type { FormState } from "@/lib/actions/types";
import { toast } from "@/components/Toast";
import { useEffect } from "react";
import { planById } from "@/lib/pricing";
import { Alert, Field, inputCls, inputErrorCls, cn } from "@/components/ui";

export default function SignupForm({ plan: planId = "annual" }: { plan?: string }) {
  const plan = planById(planId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitSignup, {});

  useEffect(() => {
    if (state.ok) toast({ title: "Request received", description: "We'll reach out on WhatsApp within 24h." });
    else if (state.error) toast({ type: "error", title: "Couldn't submit", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center rounded-[18px] border border-aqua-200 bg-aqua-50 px-6 py-10 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-aqua-500 text-white">
          <PartyPopper className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-950">Request received!</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          Thanks — we’ll contact you on WhatsApp within 24 hours with your invoice and onboarding
          steps for the {plan.name} plan. Meanwhile, explore the live demo to see what you’re getting.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
        >
          Open the live demo
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      {/* Honeypot — invisible to humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <input type="hidden" name="plan" value={plan.id} />

      {/* Selected plan summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-aqua-200 bg-aqua-50 px-3.5 py-2.5">
        <div className="text-sm">
          <p className="font-bold text-slate-900">
            {plan.name} — ${plan.price}
            <span className="font-medium text-slate-500">{plan.interval}</span>
          </p>
          <p className="text-xs text-slate-600">
            + ${plan.setupFee} one-time setup · total to start ${plan.price + plan.setupFee}
          </p>
        </div>
        <select
          aria-label="Change plan"
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          value={plan.id}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("plan", e.target.value);
            url.hash = "signup";
            window.location.assign(url.toString());
          }}
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
          <option value="lifetime">Lifetime license</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="School name" required error={state.fieldErrors?.schoolName}>
          <input
            name="schoolName"
            placeholder="e.g. Al-Huda Primary School"
            className={cn(inputCls, state.fieldErrors?.schoolName && inputErrorCls)}
          />
        </Field>
        <Field label="Your name" required error={state.fieldErrors?.contactName}>
          <input
            name="contactName"
            placeholder="e.g. Amina Yusuf"
            className={cn(inputCls, state.fieldErrors?.contactName && inputErrorCls)}
          />
        </Field>
        <Field
          label="WhatsApp number"
          required
          error={state.fieldErrors?.phone}
          hint="We set up your school and reach you here."
        >
          <input
            name="phone"
            inputMode="tel"
            placeholder="+252 61 234 5678"
            className={cn(inputCls, state.fieldErrors?.phone && inputErrorCls)}
          />
        </Field>
        <Field label="Email (optional)" error={state.fieldErrors?.email}>
          <input
            name="email"
            type="email"
            placeholder="you@school.so"
            className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)}
          />
        </Field>
      </div>
      <Field label="How many students?">
        <select name="studentCount" className={inputCls} defaultValue="">
          <option value="">Select a range…</option>
          <option value="1-100">Under 100</option>
          <option value="100-300">100 – 300</option>
          <option value="300-600">300 – 600</option>
          <option value="600+">More than 600</option>
        </select>
      </Field>
      <Field label="Anything we should know? (optional)">
        <textarea
          name="message"
          rows={2}
          placeholder="e.g. We track fees in notebooks and Excel…"
          className={inputCls}
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Request onboarding — {plan.name} plan
      </button>
      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        No payment in the browser — we activate your workspace over WhatsApp after the first invoice
        (${plan.price + plan.setupFee} total to start). Your details stay private.
      </p>
    </form>
  );
}

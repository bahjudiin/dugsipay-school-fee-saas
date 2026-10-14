"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/components/ui";
import {
  DashboardDesktopSnapshot,
  DashboardSnapshot,
  PaymentModalSnapshot,
  ReceiptSnapshot,
  ReportsSnapshot,
  StudentsSnapshot,
} from "@/components/snapshots";

const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    caption: "Collected, outstanding, paid & unpaid — live, every morning.",
    snap: (
      <div className="flex flex-wrap items-start justify-center gap-8">
        <DashboardSnapshot />
        <DashboardDesktopSnapshot />
      </div>
    ),
  },
  {
    id: "students",
    label: "Students",
    caption: "Every student with class, parent and live payment status.",
    snap: <StudentsSnapshot />,
  },
  {
    id: "payments",
    label: "Payments",
    caption: "Ten seconds to record a payment — the receipt writes itself.",
    snap: (
      <div className="flex flex-wrap items-start justify-center gap-8">
        <PaymentModalSnapshot />
        <ReceiptSnapshot />
      </div>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    caption: "Monthly summary, collection rate, and who to remind next.",
    snap: <ReportsSnapshot />,
  },
] as const;

export default function DemoTourPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("dashboard");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100" aria-label="Back home">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-primary-800 text-white">
                <GraduationCap className="size-4.5" />
              </div>
              <div>
                <p className="text-[15px] font-bold leading-tight text-slate-950">Product tour</p>
                <p className="text-[10px] font-medium text-slate-400">What your school gets — no signup needed</p>
              </div>
            </div>
          </div>
          <Link
            href="/#signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active === t.id
                  ? "bg-primary-800 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-md text-center text-sm font-medium text-slate-600">{tab.caption}</p>

        <div className="mt-8 flex justify-center">{tab.snap}</div>

        <div className="mt-10 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 active:scale-[0.98]"
          >
            Try it yourself in the live demo <ArrowRight className="size-4" />
          </Link>
          <p className="mt-3 text-xs text-slate-400">
            The interactive demo has full sample data — explore students, classes, payments, receipts and reports instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

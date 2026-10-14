import Link from "next/link";
import { Check, GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-primary-800 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-white/10">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">DuqsiPay</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-[1.15] tracking-[-0.02em]">
            School fees, finally clear.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-100">
            Students, classes, payments, receipts and WhatsApp reminders — in one app
            your whole office can use.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-primary-100">
            {[
              "Every school gets its own private workspace",
              "Your data is yours — export anytime",
              "Somali + English, built for Android phones",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-aqua-300" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-200">Muqdisho · Hargeysa · Boosaaso · Kismaayo</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-[#f5f5f7] px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-primary-800 text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950">DuqsiPay</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

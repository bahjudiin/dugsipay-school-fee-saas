import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Buttons (Apple pill shape, Action Blue) ---------- */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
export const btnAqua =
  "inline-flex items-center justify-center gap-2 rounded-full bg-aqua-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-aqua-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full border border-danger-100 bg-white px-4 py-2 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50";

/* ---------- Inputs ---------- */
export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-slate-100";
export const inputErrorCls =
  "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20";

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------- Surfaces ---------- */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-slate-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "red" | "brand" | "blue" | "aqua" | "primary";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-danger-50 text-danger-600 ring-danger-100",
    brand: "bg-aqua-50 text-aqua-700 ring-aqua-200",
    aqua: "bg-aqua-50 text-aqua-700 ring-aqua-200",
    primary: "bg-primary-50 text-primary-600 ring-primary-200",
    blue: "bg-primary-50 text-primary-600 ring-primary-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  icon,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "slate",
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  tone?: "aqua" | "primary" | "amber" | "slate";
  /** @deprecated use tone */
  accent?: boolean;
}) {
  const resolved = accent ? "aqua" : tone;
  const tiles: Record<string, string> = {
    aqua: "bg-aqua-500 text-white",
    primary: "bg-primary-600 text-white",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-500",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {sub && <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tiles[resolved])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success" | "warn";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "border-primary-200 bg-primary-50 text-primary-700",
    error: "border-danger-100 bg-danger-50 text-danger-600",
    success: "border-aqua-200 bg-aqua-50 text-aqua-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", tones[tone])}>
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChartColumn,
  FileUp,
  GraduationCap,
  History,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/components/ui";
import { t } from "@/lib/i18n";

const NAV = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/students", key: "nav.students", icon: GraduationCap },
  { href: "/classes", key: "nav.classes", icon: Layers },
  { href: "/payments", key: "nav.payments", icon: Wallet },
  { href: "/reports", key: "nav.reports", icon: ChartColumn },
  { href: "/import", key: "nav.import", icon: FileUp },
  { href: "/activity", key: "nav.activity", icon: History },
  { href: "/settings", key: "nav.settings", icon: SettingsIcon },
] as const;

function NavItems({
  lang,
  onNavigate,
}: {
  lang: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-aqua-600" : "text-slate-400 group-hover:text-slate-600",
              )}
            />
            <span className="truncate">{t(lang, item.key)}</span>
            {active && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-aqua-500" />}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ schoolName, logoData }: { schoolName: string; logoData: string | null }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      {logoData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoData}
          alt="School logo"
          className="size-9 rounded-lg border border-slate-200 bg-white object-contain p-0.5"
        />
      ) : (
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-600 text-white">
          <GraduationCap className="size-4.5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight text-slate-900">{schoolName}</p>
        <p className="text-[11px] font-medium text-slate-400">DuqsiPay</p>
      </div>
    </Link>
  );
}

function UserFooter({ name, role, lang }: { name: string; role: string; lang: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (role === "demo") {
    return (
      <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-950">Demo Portal</p>
            <p className="text-[10px] text-amber-800">Sample School</p>
          </div>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-900">
            Read-only
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white py-1.5 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <LogIn className="size-3" /> Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center justify-center gap-1 rounded-lg bg-primary-600 py-1.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-primary-500"
          >
            <UserPlus className="size-3" /> Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
        {name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{role}</p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await logout();
          router.replace("/login");
          router.refresh();
        }}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-danger-500"
        title={lang === "so" ? "Ka bax" : "Log out"}
        aria-label="Log out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export default function AppShell({
  schoolName,
  logoData,
  lang,
  userName,
  userRole,
  children,
}: {
  schoolName: string;
  logoData: string | null;
  lang: string;
  userName?: string;
  userRole?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <div className="space-y-6">
          <div className="px-1">
            <Brand schoolName={schoolName} logoData={logoData} />
          </div>
          <NavItems lang={lang} />
        </div>
        <div className="space-y-3 px-1">
          {userName && <UserFooter name={userName} role={userRole ?? "staff"} lang={lang} />}
          <p className="px-2 text-[11px] leading-relaxed text-slate-400">
            {t(lang, "app.tagline")}
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="no-print sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <p className="truncate text-sm font-bold text-slate-900">{schoolName}</p>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-primary-950/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col justify-between bg-white shadow-2xl">
            <div className="space-y-6 p-5">
              <div className="flex items-center justify-between">
                <Brand schoolName={schoolName} logoData={logoData} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <NavItems lang={lang} onNavigate={() => setOpen(false)} />
            </div>
            <div className="space-y-3 p-5">
              {userName && <UserFooter name={userName} role={userRole ?? "staff"} lang={lang} />}
              <p className="text-[11px] text-slate-400">{t(lang, "app.tagline")}</p>
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
    </div>
  );
}

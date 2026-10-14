import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getAuthUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  const settings = await getSettings();

  return (
    <AppShell
      schoolName={settings.schoolName}
      logoData={settings.logoData}
      lang={settings.language}
      userName={user.name || user.email}
      userRole={user.role}
    >
      {user.role === "demo" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-950 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500 text-xs font-bold text-white">
              DEMO
            </span>
            <p className="leading-snug">
              <span className="font-bold">Live Demo Mode (Read-Only)</span> — You are exploring
              live sample school data. You can create your own private school workspace anytime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
            >
              <LogIn className="size-3.5" /> Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-500"
            >
              <UserPlus className="size-3.5" /> Create Real Account
            </Link>
          </div>
        </div>
      )}
      {children}
    </AppShell>
  );
}

import AppShell from "@/components/AppShell";
import { getAuthUser } from "@/lib/auth";
import { ensureDemoSampleData } from "@/lib/demo-seed";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  const settings = await getSettings();
  // Anonymous demo visitors always land on a school with sample students.
  await ensureDemoSampleData();

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
        </div>
      )}
      {children}
    </AppShell>
  );
}

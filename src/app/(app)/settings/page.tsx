import Link from "next/link";
import { ArrowRight, Layers, ShieldAlert } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { canAdmin, getAuthUser } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";
import DataTools from "@/components/DataTools";
import StaffManager from "@/components/StaffManager";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const user = await getAuthUser();
  const admin = canAdmin(user);

  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Customize the school profile, currency, language, receipts, staff and data tools."
      />

      {admin ? (
        <>
          <Card className="p-5 sm:p-6">
            <SettingsForm settings={settings} />
          </Card>

          <Link href="/classes" className="group block">
            <Card className="flex items-center gap-4 p-5 transition hover:border-primary-200">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <Layers className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">Classes & monthly fees</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Manage your classes, fees and see enrollment on the dedicated Classes page.
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
            </Card>
          </Link>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 text-sm font-bold text-slate-900">Staff accounts</h2>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Add office staff with their own login. Every action they take is recorded in Activity.
            </p>
            <StaffManager />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 text-sm font-bold text-slate-900">Data & safety</h2>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Records are protected: students with payment history cannot be hard-deleted, class deletion is blocked while students are enrolled, and every deletion is recorded in Activity.
            </p>
            <DataTools />
          </Card>
        </>
      ) : (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {user.role === "demo" ? "Demo Mode (Read-Only)" : "Admin access required"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {user.role === "demo"
                  ? "Settings, staff accounts, and system data tools are locked in public demo mode. Sign in to your school account or create a new workspace to customize your school."
                  : "Settings, staff accounts, classes and data tools can only be changed by the owner or an admin. You can still register students, record payments, import CSV and send reminders."}
              </p>
              {user.role === "demo" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Sign in to school
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-500"
                  >
                    Create real account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

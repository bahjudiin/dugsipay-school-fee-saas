import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  Banknote,
  FileUp,
  GraduationCap,
  History,
  Layers,
  Settings2,
  Trash2,
} from "lucide-react";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { ensureDemoSampleData } from "@/lib/demo-seed";
import { Badge, Card, EmptyState, PageHeader, cn } from "@/components/ui";
import { formatDateTime, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const GROUPS = [
  { key: "", label: "All" },
  { key: "student", label: "Students" },
  { key: "payment", label: "Payments" },
  { key: "import", label: "Imports" },
  { key: "settings", label: "Settings" },
  { key: "class", label: "Classes" },
  { key: "data", label: "Data" },
] as const;

function typeStyle(type: string): { icon: React.ReactNode; cls: string } {
  if (type.startsWith("payment"))
    return { icon: <Banknote className="size-4" />, cls: "bg-aqua-50 text-aqua-700" };
  if (type.startsWith("student"))
    return { icon: <GraduationCap className="size-4" />, cls: "bg-primary-50 text-primary-600" };
  if (type.startsWith("import"))
    return { icon: <FileUp className="size-4" />, cls: "bg-violet-50 text-violet-700" };
  if (type.startsWith("settings"))
    return { icon: <Settings2 className="size-4" />, cls: "bg-amber-50 text-amber-700" };
  if (type.startsWith("class"))
    return { icon: <Layers className="size-4" />, cls: "bg-aqua-50 text-aqua-700" };
  return { icon: <Trash2 className="size-4" />, cls: "bg-slate-100 text-slate-600" };
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await ensureDemoSampleData();
  const group = typeof sp.group === "string" ? sp.group : "";

  const all = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(300);
  const filtered = group ? all.filter((a) => a.type.startsWith(group)) : all;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader
        title="Activity"
        subtitle="Every important action — student changes, payments, imports and settings — is recorded here."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {GROUPS.map((g) => (
          <Link
            key={g.key}
            href={g.key ? `/activity?group=${g.key}` : "/activity"}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition",
              group === g.key
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {g.label}
          </Link>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History className="size-6" />}
            title="No activity yet"
            hint="Actions like adding students, recording payments, imports and settings changes will appear here."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((a) => {
              const style = typeStyle(a.type);
              return (
                <li key={a.id} className="flex items-start gap-3.5 px-5 py-4">
                  <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl", style.cls)}>
                    {style.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-800">{a.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone="slate">{a.type}</Badge>
                      <span className="text-[11px] text-slate-400" title={formatDateTime(a.createdAt)}>
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-slate-400 sm:block">
                    {formatDateTime(a.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {all.length === 300 && (
        <p className="mt-3 text-center text-xs text-slate-400">Showing the most recent 300 entries.</p>
      )}
    </div>
  );
}

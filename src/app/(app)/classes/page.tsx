import Link from "next/link";
import { asc, eq, gte, sql } from "drizzle-orm";
import { ArrowRight, GraduationCap } from "lucide-react";
import { db } from "@/db";
import { classes, payments, students } from "@/db/schema";
import { ensureDemoSampleData } from "@/lib/demo-seed";
import { getSettings } from "@/lib/settings";
import ClassesManager from "@/components/ClassesManager";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { money, monthLabel, currentYearMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  await ensureDemoSampleData();
  const settings = await getSettings();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [classRows, perClass] = await Promise.all([
    db.select().from(classes).orderBy(asc(classes.sortOrder), asc(classes.name)),
    db
      .select({
        classId: students.classId,
        activeCount: sql<number>`count(*) filter (where ${students.status} = 'active')::int`,
        archivedCount: sql<number>`count(*) filter (where ${students.status} = 'archived')::int`,
      })
      .from(students)
      .groupBy(students.classId),
  ]);

  const collectedRows = await db
    .select({
      classId: students.classId,
      total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
    })
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.id))
    .where(gte(payments.createdAt, monthStart))
    .groupBy(students.classId);
  const collectedByClass = new Map(collectedRows.map((r) => [r.classId, Number(r.total)]));
  const countsByClass = new Map(perClass.map((r) => [r.classId, r]));

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <PageHeader
        title="Classes"
        subtitle={`${classRows.length} class${classRows.length === 1 ? "" : "es"} · monthly fees drive balances and payment auto-fill`}
      />

      {classRows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<GraduationCap className="size-6" />}
            title="No classes yet"
            hint="Add your first class below — students are grouped by class and each class carries a monthly fee."
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {classRows.map((c) => {
            const counts = countsByClass.get(c.id);
            const collected = collectedByClass.get(c.id) ?? 0;
            return (
              <Card key={c.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-[15px] font-bold text-slate-900">{c.name}</h2>
                  <Badge tone="aqua">{money(c.monthlyFee, settings.currency)}/mo</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Active</dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-900">{counts?.activeCount ?? 0}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Collected</dt>
                    <dd className="mt-0.5 truncate text-sm font-bold text-aqua-700" title={money(collected, settings.currency)}>
                      {money(collected, settings.currency)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Archived</dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-500">{counts?.archivedCount ?? 0}</dd>
                  </div>
                </dl>
                <Link
                  href={`/students?classId=${c.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View students <ArrowRight className="size-3.5" />
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-bold text-slate-900">Manage classes & fees</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Collected figures cover {monthLabel(currentYearMonth())}. Classes with students can’t be deleted — move students first.
          </p>
        </div>
        <ClassesManager
          classes={classRows.map((c) => ({ id: c.id, name: c.name, monthlyFee: c.monthlyFee }))}
          currency={settings.currency}
        />
      </Card>
    </div>
  );
}

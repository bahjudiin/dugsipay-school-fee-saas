import Link from "next/link";
import { desc, eq, gte, sql } from "drizzle-orm";
import {
  ArrowRight,
  Banknote,
  GraduationCap,
  Plus,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { activityLog, classes, payments, students } from "@/db/schema";
import { ensureDemoSampleData } from "@/lib/demo-seed";
import { getSettings } from "@/lib/settings";
import { Badge, Card, EmptyState, PageHeader, Stat, btnPrimary, btnSecondary, cn } from "@/components/ui";
import { formatDate, money, monthLabel, monthsElapsed, currentYearMonth, timeAgo } from "@/lib/format";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureDemoSampleData();
  const settings = await getSettings();
  const cur = settings.currency;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [activeStudents, monthAgg, recentPayments, recentActivity, classRows, paidTotals] =
    await Promise.all([
      db
        .select({
          id: students.id,
          classId: students.classId,
          fee: classes.monthlyFee,
          enrolledAt: students.enrolledAt,
        })
        .from(students)
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(eq(students.status, "active")),
      db
        .select({
          total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
          count: sql<number>`count(*)::int`,
          payers: sql<number>`count(distinct ${payments.studentId})::int`,
        })
        .from(payments)
        .where(gte(payments.createdAt, monthStart)),
      db.select().from(payments).orderBy(desc(payments.createdAt)).limit(6),
      db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(6),
      db.select().from(classes).orderBy(classes.sortOrder),
      db
        .select({
          studentId: payments.studentId,
          total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
        })
        .from(payments)
        .groupBy(payments.studentId),
    ]);

  const paidByStudent = new Map(paidTotals.map((p) => [p.studentId, Number(p.total)]));
  const countByClass = new Map<number, number>();
  let outstanding = 0;
  let overdueCount = 0;
  for (const s of activeStudents) {
    const due = monthsElapsed(s.enrolledAt) * Number(s.fee ?? 0);
    const paid = paidByStudent.get(s.id) ?? 0;
    const bal = Math.max(0, due - paid);
    outstanding += bal;
    if (bal > 0) overdueCount++;
    countByClass.set(s.classId, (countByClass.get(s.classId) ?? 0) + 1);
  }

  const monthTotal = Number(monthAgg[0]?.total ?? 0);
  const monthCount = monthAgg[0]?.count ?? 0;
  const payerCount = monthAgg[0]?.payers ?? 0;

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "greet.morning" : hour < 17 ? "greet.afternoon" : "greet.evening";
  const greeting = t(settings.language, greetKey).replace("{n}", settings.schoolName);

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <PageHeader
        title={greeting}
        subtitle={
          settings.language === "so"
            ? "Waa kuwan warbixinta lacagaha iskuulkaaga."
            : "Here is the financial pulse of your school today."
        }
        actions={
          <>
            <Link href="/payments#record" className={btnSecondary}>
              <ReceiptText className="size-4" />
              {t(settings.language, "common.recordPayment")}
            </Link>
            <Link href="/students/new" className={btnPrimary}>
              <Plus className="size-4" />
              {t(settings.language, "common.addStudent")}
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          tone="aqua"
          label={t(settings.language, "dash.collectedMonth")}
          value={money(monthTotal, cur)}
          sub={`${monthCount} payment${monthCount === 1 ? "" : "s"} in ${monthLabel(currentYearMonth())}`}
          icon={<Banknote className="size-5" />}
        />
        <Stat
          tone="primary"
          label={t(settings.language, "dash.studentsPaid")}
          value={`${payerCount} / ${activeStudents.length}`}
          sub={t(settings.language, "dash.thisMonth")}
          icon={<ReceiptText className="size-5" />}
        />
        <Stat
          tone="amber"
          label={t(settings.language, "dash.overdue")}
          value={String(overdueCount)}
          sub={`${t(settings.language, "dash.notPaidYet")} · ${money(outstanding, cur)}`}
          icon={<TrendingUp className="size-5" />}
        />
        <Stat
          label={t(settings.language, "dash.totalStudents")}
          value={String(activeStudents.length)}
          sub={t(settings.language, "dash.classesCount").replace("{n}", String(classRows.length))}
          icon={<GraduationCap className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Recent payments */}
        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              {t(settings.language, "dash.recentPayments")}
            </h2>
            <Link
              href="/payments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <EmptyState
              title="No payments yet"
              hint="Record the first fee payment to see it here."
              action={
                <Link href="/payments" className={btnPrimary}>
                  <Plus className="size-4" /> Record payment
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-aqua-50 text-xs font-bold text-aqua-700">
                    {p.studentName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/students/${p.studentId}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-primary-600"
                    >
                      {p.studentName}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {p.className} · {formatDate(p.createdAt)} · {p.method}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">{money(p.amount, cur)}</p>
                    <Link
                      href={`/receipts/${p.id}`}
                      className="font-mono text-[11px] font-semibold text-primary-600 hover:underline"
                    >
                      {p.receiptNo}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">Latest activity</h2>
            <Link
              href="/activity"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState title="Nothing yet" hint="Actions you take will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      a.type.startsWith("payment")
                        ? "bg-aqua-500"
                        : a.type.startsWith("student")
                          ? "bg-primary-400"
                          : a.type === "import.completed"
                            ? "bg-violet-400"
                            : "bg-amber-400",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] leading-snug text-slate-700">{a.message}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Classes overview */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Classes & fees</h2>
          <Link
            href="/classes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Manage <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {classRows.length === 0 ? (
          <EmptyState
            title="No classes configured"
            hint="Create classes and their monthly fees, then start adding students."
            action={
              <Link href="/classes" className={btnSecondary}>
                Set up classes
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {classRows.map((c) => {
              const count = countByClass.get(c.id) ?? 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/students?classId=${c.id}`}
                    className="group flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/70"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-xs font-bold text-primary-600">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{money(c.monthlyFee, cur)} / month</p>
                    </div>
                    <Badge tone={count > 0 ? "aqua" : "slate"}>
                      {count} student{count === 1 ? "" : "s"}
                    </Badge>
                    <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

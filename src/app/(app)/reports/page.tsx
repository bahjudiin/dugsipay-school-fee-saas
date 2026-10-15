import Link from "next/link";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { CalendarRange, ChartColumn,  TrendingUp, Users, Wallet } from "lucide-react";
import { db } from "@/db";
import { classes, payments, students } from "@/db/schema";
import { ensureDemoSampleData } from "@/lib/demo-seed";
import { getSettings } from "@/lib/settings";
import { Badge, Card, EmptyState, PageHeader, cn, inputCls } from "@/components/ui";
import ContactMenu from "@/components/ContactMenu";
import { displayPhone } from "@/lib/phone";
import { reminderMessage as reminderTpl } from "@/lib/messages";
import { money, monthLabel, currentYearMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await ensureDemoSampleData();
  const settings = await getSettings();
  const cur = settings.currency;

  const rawMonth = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : currentYearMonth();
  const [y, m] = rawMonth.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const [activeStudents, monthPayments, paidUpTo] = await Promise.all([
    db
      .select({
        id: students.id,
        rollNo: students.rollNo,
        firstName: students.firstName,
        lastName: students.lastName,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
        enrolledAt: students.enrolledAt,
        classId: students.classId,
        fee: classes.monthlyFee,
        className: classes.name,
      })
      .from(students)
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(and(eq(students.status, "active"), lt(students.enrolledAt, end)))
      .orderBy(asc(students.rollNo)),
    db
      .select({ studentId: payments.studentId, total: sql<string>`coalesce(sum(${payments.amount}),0)` })
      .from(payments)
      .where(and(gte(payments.createdAt, start), lt(payments.createdAt, end)))
      .groupBy(payments.studentId),
    db
      .select({ studentId: payments.studentId, total: sql<string>`coalesce(sum(${payments.amount}),0)` })
      .from(payments)
      .where(lt(payments.createdAt, end))
      .groupBy(payments.studentId),
  ]);

  const collectedByStudent = new Map(monthPayments.map((p) => [p.studentId, Number(p.total)]));
  const paidByStudent = new Map(paidUpTo.map((p) => [p.studentId, Number(p.total)]));

  const monthsDue = (enrolledAt: Date) => {
    const s = new Date(Math.min(enrolledAt.getTime(), end.getTime() - 1));
    return Math.max(1, (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth()) + 1);
  };

  const rows = activeStudents.map((s) => {
    const fee = Number(s.fee ?? 0);
    const collected = collectedByStudent.get(s.id) ?? 0;
    const due = monthsDue(s.enrolledAt) * fee;
    const paid = paidByStudent.get(s.id) ?? 0;
    const balance = Math.max(0, due - paid);
    return { ...s, fee, collected, due, paid, balance };
  });

  const totalExpected = rows.reduce((a, r) => a + r.fee, 0);
  const totalCollected = rows.reduce((a, r) => a + r.collected, 0);
  const totalOutstanding = rows.reduce((a, r) => a + r.balance, 0);
  const withBalance = rows.filter((r) => r.balance > 0).sort((a, b) => b.balance - a.balance);
  const paymentCount = monthPayments.length;
  const rate = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

  // Per-class aggregation
  const classAgg = new Map<number, { name: string; students: number; expected: number; collected: number; outstanding: number }>();
  for (const r of rows) {
    const agg = classAgg.get(r.classId) ?? { name: r.className ?? "—", students: 0, expected: 0, collected: 0, outstanding: 0 };
    agg.students++;
    agg.expected += r.fee;
    agg.collected += r.collected;
    agg.outstanding += r.balance;
    classAgg.set(r.classId, agg);
  }
  const classRows = [...classAgg.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));

  const reminder = (name: string, rollNo: string, className: string | null, balance: number, parentName: string) =>
    reminderTpl(settings.language, {
      parentName,
      schoolName: settings.schoolName,
      studentName: name,
      rollNo,
      className: className ?? "",
      balance: money(balance, cur),
    });

  return (
    <div className="mx-auto max-w-6xl animate-fade-up space-y-6">
      <PageHeader
        title="Reports"
        subtitle={`Monthly fee collection and outstanding balances — ${monthLabel(rawMonth)}`}
        actions={
          <form action="/reports" method="get" className="flex items-center gap-2">
            <label htmlFor="month" className="sr-only">
              Report month
            </label>
            <input id="month" type="month" name="month" defaultValue={rawMonth} className={cn(inputCls, "w-40")} />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
              <CalendarRange className="size-4" /> Apply
            </button>
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Collected</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{money(totalCollected, cur)}</p>
              <p className="mt-0.5 text-xs text-slate-500">of {money(totalExpected, cur)} billed</p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-aqua-500 text-white">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-aqua-500" style={{ width: `${rate}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-aqua-700">{rate}% collection rate</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Outstanding</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{money(totalOutstanding, cur)}</p>
              <p className="mt-0.5 text-xs text-slate-500">{withBalance.length} student{withBalance.length === 1 ? "" : "s"} with balance</p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Paying students</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{paymentCount}</p>
              <p className="mt-0.5 text-xs text-slate-500">paid during {monthLabel(rawMonth)}</p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-primary-600 text-white">
              <Users className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-500">Active classes</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{classRows.length}</p>
              <p className="mt-0.5 text-xs text-slate-500">{rows.length} billable students</p>
            </div>
            <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <ChartColumn className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Per-class breakdown */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Collection by class</h2>
        </div>
        {classRows.length === 0 ? (
          <EmptyState title="No billable students in this month" hint="Once students are enrolled and classes configured, the breakdown appears here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 text-right font-semibold">Students</th>
                  <th className="px-5 py-3 text-right font-semibold">Billed</th>
                  <th className="px-5 py-3 text-right font-semibold">Collected</th>
                  <th className="px-5 py-3 text-right font-semibold">Outstanding</th>
                  <th className="px-5 py-3 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classRows.map(([id, c]) => {
                  const r = c.expected > 0 ? Math.min(100, Math.round((c.collected / c.expected) * 100)) : 0;
                  return (
                    <tr key={id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{c.students}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{money(c.expected, cur)}</td>
                      <td className="px-5 py-3 text-right font-medium text-aqua-700">{money(c.collected, cur)}</td>
                      <td className={cn("px-5 py-3 text-right font-medium", c.outstanding > 0 ? "text-amber-700" : "text-slate-400")}>
                        {c.outstanding > 0 ? money(c.outstanding, cur) : "—"}
                      </td>
                      <td className="min-w-28 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-aqua-500" style={{ width: `${r}%` }} />
                          </div>
                          <span className="w-8 text-xs font-semibold text-slate-600">{r}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Outstanding students */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Outstanding balances</h2>
            <p className="mt-0.5 text-xs text-slate-500">Largest debts first · up to {monthLabel(rawMonth)}</p>
          </div>
          {withBalance.length > 0 && <Badge tone="amber">{withBalance.length} pending</Badge>}
        </div>
        {withBalance.length === 0 ? (
          <EmptyState
            title="Everyone is clear"
            hint="No active student has an outstanding balance for this period. Great job!"
          />
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 lg:hidden">
              {withBalance.slice(0, 20).map((r) => {
                const name = `${r.firstName} ${r.lastName}`.trim();
                return (
                  <li key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/students/${r.id}`} className="block truncate text-sm font-semibold text-slate-900">
                          {name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">
                          <span className="font-mono">{r.rollNo}</span> · {r.className ?? "—"}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-amber-700">{money(r.balance, cur)}</p>
                    </div>
                    {r.parentPhone && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <ContactMenu
                          phone={r.parentPhone}
                          message={reminder(name, r.rollNo, r.className, r.balance, r.parentName)}
                          label="Send reminder"
                        />
                        <span className="text-[11px] text-slate-400">+{r.parentPhone}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Class</th>
                    <th className="px-5 py-3 font-semibold">Parent</th>
                    <th className="px-5 py-3 text-right font-semibold">Paid</th>
                    <th className="px-5 py-3 text-right font-semibold">Balance</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {withBalance.slice(0, 20).map((r) => {
                    const name = `${r.firstName} ${r.lastName}`.trim();
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <Link href={`/students/${r.id}`} className="font-semibold text-slate-900 hover:text-primary-600">
                            {name}
                          </Link>
                          <span className="ml-2 font-mono text-xs text-slate-400">{r.rollNo}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{r.className ?? "—"}</td>
                        <td className="px-5 py-3 text-slate-600">
                          {r.parentName || "—"}
                          {r.parentPhone && <span className="ml-1.5 text-xs text-slate-400">{displayPhone(r.parentPhone)}</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-600">{money(r.paid, cur)}</td>
                        <td className="px-5 py-3 text-right font-bold text-amber-700">{money(r.balance, cur)}</td>
                        <td className="px-5 py-3 text-right">
                          {r.parentPhone && (
                            <ContactMenu
                              variant="icon"
                              phone={r.parentPhone}
                              message={reminder(name, r.rollNo, r.className, r.balance, r.parentName)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {withBalance.length > 20 && (
          <p className="border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-400">
            Showing the 20 largest balances of {withBalance.length}.
          </p>
        )}
      </Card>

      <p className="text-xs leading-relaxed text-slate-400">
        Balances are estimated as months since enrolment × class fee minus total payments received.
        WhatsApp links open the app with a pre-filled message — nothing is sent automatically.
      </p>
    </div>
  );
}

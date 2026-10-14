import Link from "next/link";
import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { ChevronLeft, ChevronRight, ChevronRight as GoIcon, GraduationCap,  Plus } from "lucide-react";
import { db } from "@/db";
import { classes, payments, students } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import StudentsFilterBar from "@/components/StudentsFilterBar";
import StudentRowActions from "@/components/StudentRowActions";
import { Badge, Card, EmptyState, PageHeader, btnPrimary, cn } from "@/components/ui";
import { money, monthsElapsed } from "@/lib/format";
import { reminderMessage as reminderTpl } from "@/lib/messages";
import ContactMenu from "@/components/ContactMenu";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const q = (typeof sp.q === "string" ? sp.q : "").trim();
  const classId = typeof sp.classId === "string" && sp.classId ? Number(sp.classId) : null;
  const status = typeof sp.status === "string" ? sp.status : "active";
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);

  const conds: SQL[] = [];
  if (status === "active" || status === "archived") conds.push(eq(students.status, status));
  if (classId && Number.isInteger(classId)) conds.push(eq(students.classId, classId));
  if (q) {
    const like = `%${q}%`;
    conds.push(
      or(
        ilike(students.firstName, like),
        ilike(students.lastName, like),
        ilike(students.rollNo, like),
        ilike(sql`${students.firstName} || ' ' || ${students.lastName}`, like),
      )!,
    );
  }
  const where = conds.length ? and(...conds) : undefined;

  // All four reads are independent — run them in one round-trip window.
  const [classRows, [{ count }], rows, totals] = await Promise.all([
    db.select().from(classes).orderBy(asc(classes.sortOrder), asc(classes.name)),
    db.select({ count: sql<number>`count(*)::int` }).from(students).where(where),
    db
      .select({
        id: students.id,
        rollNo: students.rollNo,
        firstName: students.firstName,
        lastName: students.lastName,
        status: students.status,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
        enrolledAt: students.enrolledAt,
        className: classes.name,
        fee: classes.monthlyFee,
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(where)
      .orderBy(asc(students.rollNo))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({
        studentId: payments.studentId,
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .groupBy(payments.studentId),
  ]);
  const paidByStudent = new Map(totals.map((t) => [t.studentId, Number(t.total)]));

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (classId) p.set("classId", String(classId));
    if (status !== "active") p.set("status", status);
    for (const [k, v] of Object.entries(over)) p.set(k, v);
    return `/students?${p.toString()}`;
  };

  const enriched = rows.map((s) => {
    const name = `${s.firstName} ${s.lastName}`.trim();
    const paid = paidByStudent.get(s.id) ?? 0;
    const balance = Math.max(0, monthsElapsed(s.enrolledAt) * Number(s.fee ?? 0) - paid);
    const waMsg = s.parentPhone
      ? reminderTpl(settings.language, {
          parentName: s.parentName,
          schoolName: settings.schoolName,
          studentName: name,
          rollNo: s.rollNo,
          className: s.className ?? "",
          balance: money(balance, settings.currency),
        })
      : null;
    return { ...s, name, paid, balance, waMsg };
  });

  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      <PageHeader
        title="Students"
        subtitle={`${count} ${status === "archived" ? "archived " : ""}student${count === 1 ? "" : "s"}`}
        actions={
          <Link href="/students/new" className={btnPrimary}>
            <Plus className="size-4" /> Add student
          </Link>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <StudentsFilterBar classes={classRows.map((c) => ({ id: c.id, name: c.name }))} />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-6" />}
            title={q || classId ? "No students match your filters" : "No students yet"}
            hint={
              q || classId
                ? "Try a different search term or clear the filters."
                : "Add students manually or import them from a CSV file."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/students/new" className={btnPrimary}>
                  <Plus className="size-4" /> Add student
                </Link>
                <Link href="/import" className={cn(btnPrimary, "bg-primary-700 hover:bg-primary-800")}>
                  Import CSV
                </Link>
              </div>
            }
          />
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 lg:hidden">
              {enriched.map((s) => (
                <li key={s.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                      {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/students/${s.id}`} className="block truncate text-[15px] font-semibold text-slate-900">
                        {s.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        <span className="font-mono">{s.rollNo}</span> · {s.className ?? "No class"}
                      </p>
                      {s.parentName && (
                        <p className="mt-0.5 truncate text-xs text-slate-400">{s.parentName}</p>
                      )}
                    </div>
                    <Badge tone={s.status === "active" ? "green" : "slate"}>{s.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        Paid <span className="font-semibold text-slate-800">{money(s.paid, settings.currency)}</span>
                      </span>
                      <span className={cn("font-semibold", s.balance > 0 ? "text-amber-700" : "text-aqua-700")}>
                        {s.balance > 0 ? `Due ${money(s.balance, settings.currency)}` : "Clear"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {s.parentPhone && s.waMsg && (
                        <ContactMenu variant="icon" phone={s.parentPhone} message={s.waMsg} />
                      )}
                      <Link
                        href={`/students/${s.id}`}
                        className="inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
                      >
                        View <GoIcon className="size-3.5" />
                      </Link>
                      <StudentRowActions id={s.id} name={s.name} archived={s.status === "archived"} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Roll №</th>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Class</th>
                    <th className="px-5 py-3 font-semibold">Parent</th>
                    <th className="px-5 py-3 text-right font-semibold">Paid</th>
                    <th className="px-5 py-3 text-right font-semibold">Balance</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enriched.map((s) => (
                    <tr key={s.id} className="group transition hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-500">{s.rollNo}</span>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/students/${s.id}`} className="font-semibold text-slate-900 hover:text-primary-600">
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{s.className ?? "—"}</td>
                      <td className="px-5 py-3">
                        <p className="text-slate-700">{s.parentName || "—"}</p>
                        <p className="text-xs text-slate-400">{s.parentPhone ? `+${s.parentPhone}` : ""}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-700">
                        {money(s.paid, settings.currency)}
                      </td>
                      <td className={cn("px-5 py-3 text-right font-semibold", s.balance > 0 ? "text-amber-700" : "text-aqua-700")}>
                        {s.balance > 0 ? money(s.balance, settings.currency) : "Clear"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={s.status === "active" ? "green" : "slate"}>{s.status}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                          {s.parentPhone && s.waMsg && (
                            <ContactMenu variant="icon" phone={s.parentPhone} message={s.waMsg} />
                          )}
                          <StudentRowActions id={s.id} name={s.name} archived={s.status === "archived"} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <p className="text-slate-500">
              Page {page} of {pageCount}
            </p>
            <div className="flex gap-2">
              <Link
                aria-disabled={page <= 1}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600",
                  page <= 1 && "pointer-events-none opacity-40",
                )}
                href={qs({ page: String(page - 1) })}
              >
                <ChevronLeft className="size-4" /> Prev
              </Link>
              <Link
                aria-disabled={page >= pageCount}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600",
                  page >= pageCount && "pointer-events-none opacity-40",
                )}
                href={qs({ page: String(page + 1) })}
              >
                Next <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  ArrowLeft,
  Banknote,
  Pencil,
  Phone,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { db } from "@/db";
import { classes, payments, students } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import StudentForm from "@/components/StudentForm";
import StudentRowActions from "@/components/StudentRowActions";
import PaymentForm from "@/components/PaymentForm";
import { Badge, Card, EmptyState, PageHeader, Stat, btnSecondary } from "@/components/ui";
import ContactMenu from "@/components/ContactMenu";
import { displayPhone, telLink } from "@/lib/phone";
import { reminderMessage as reminderTpl } from "@/lib/messages";
import { formatDate, money, monthLabel, monthsElapsed } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const editing = sp.edit === "1";
  const settings = await getSettings();

  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const [s] = await db
    .select({
      student: students,
      className: classes.name,
      fee: classes.monthlyFee,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.id, studentId))
    .limit(1);
  if (!s) notFound();

  const [classRows, history] = await Promise.all([
    db.select().from(classes).orderBy(asc(classes.sortOrder), asc(classes.name)),
    db
      .select()
      .from(payments)
      .where(eq(payments.studentId, studentId))
      .orderBy(desc(payments.createdAt)),
  ]);

  const totalPaid = history.reduce((a, p) => a + Number(p.amount), 0);
  const due = monthsElapsed(s.student.enrolledAt) * Number(s.fee ?? 0);
  const balance = Math.max(0, due - totalPaid);
  const name = `${s.student.firstName} ${s.student.lastName}`.trim();
  const phoneDigits = s.student.parentPhone;

  const reminderMessage = reminderTpl(settings.language, {
    parentName: s.student.parentName,
    schoolName: settings.schoolName,
    studentName: name,
    rollNo: s.student.rollNo,
    className: s.className ?? "",
    balance: money(balance, settings.currency),
  });

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <Link
        href="/students"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back to students
      </Link>

      {/* Profile header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-1.5 bg-aqua-500" />
        <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-600 text-lg font-bold text-white sm:size-16 sm:text-xl">
            {name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 basis-48">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-950">{name}</h1>
              <Badge tone={s.student.status === "active" ? "green" : "slate"}>{s.student.status}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              <span className="font-mono">{s.student.rollNo}</span> · {s.className ?? "No class"} ·
              {s.student.gender ? ` ${s.student.gender} ·` : ""} enrolled {formatDate(s.student.enrolledAt)}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {s.student.parentName || "No parent recorded"}
              {phoneDigits ? ` · ${displayPhone(phoneDigits)}` : ""}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {phoneDigits && (
              <>
                <a href={telLink(phoneDigits)} className={btnSecondary} title="Call parent">
                  <Phone className="size-4" /> Call
                </a>
                <ContactMenu phone={phoneDigits} message={reminderMessage} label="Send fee reminder" />
              </>
            )}
            <Link href={`/students/${s.student.id}?edit=1`} className={btnSecondary}>
              <Pencil className="size-4" /> Edit
            </Link>
            <StudentRowActions id={s.student.id} name={name} archived={s.student.status === "archived"} />
          </div>
        </div>
        {phoneDigits && (
          <p className="border-t border-slate-100 bg-slate-50 px-6 py-2 text-[11px] leading-relaxed text-slate-500">
            WhatsApp / SMS buttons open the app with your message pre-filled — nothing is sent automatically. If a link is blocked, use “WhatsApp Web” or copy the text.
          </p>
        )}
      </Card>

      {editing ? (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Edit student</h2>
          <StudentForm
            classes={classRows}
            initial={{
              id: s.student.id,
              rollNo: s.student.rollNo,
              firstName: s.student.firstName,
              lastName: s.student.lastName,
              classId: s.student.classId,
              gender: s.student.gender,
              parentName: s.student.parentName,
              parentPhone: s.student.parentPhone,
              notes: s.student.notes,
            }}
            phoneHint="Will be normalized to +252 format for WhatsApp."
          />
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total paid" value={money(totalPaid, settings.currency)} icon={<Wallet className="size-5" />} />
            <Stat label="Est. due to date" value={money(due, settings.currency)} icon={<TrendingUp className="size-5" />} />
            <Stat
              accent={balance > 0}
              label="Balance"
              value={money(balance, settings.currency)}
              sub={balance > 0 ? "Outstanding" : "Clear"}
              icon={<Banknote className="size-5" />}
            />
          </div>

          {/* Payment history */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-900">
                Payment history · {history.length}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                History is kept as recorded — it never changes when the student profile is edited.
              </p>
            </div>
            {history.length === 0 ? (
              <EmptyState
                icon={<ReceiptText className="size-6" />}
                title="No payments recorded yet"
                hint="Use the form on this page to record the first payment."
              />
            ) : (
              <>
                {/* Mobile list */}
                <ul className="divide-y divide-slate-100 sm:hidden">
                  {history.map((p) => (
                    <li key={p.id} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{monthLabel(p.forMonth)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatDate(p.createdAt)} · {p.method}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-slate-900">{money(p.amount, settings.currency)}</p>
                          <Link href={`/receipts/${p.id}`} className="font-mono text-[11px] font-semibold text-primary-600 hover:underline">
                            {p.receiptNo}
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* Table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3 font-semibold">Receipt</th>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Month</th>
                        <th className="px-5 py-3 font-semibold">Method</th>
                        <th className="px-5 py-3 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((p) => (
                        <tr key={p.id}>
                          <td className="px-5 py-3">
                            <Link
                              href={`/receipts/${p.id}`}
                              className="font-mono text-xs font-semibold text-primary-600 hover:underline"
                            >
                              {p.receiptNo}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{formatDate(p.createdAt)}</td>
                          <td className="px-5 py-3 text-slate-600">{monthLabel(p.forMonth)}</td>
                          <td className="px-5 py-3 text-slate-600">{p.method}</td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900">
                            {money(p.amount, settings.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Record payment */}
        <Card className="h-fit p-5 lg:sticky lg:top-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Record a payment</h2>
          <PaymentForm
            currency={settings.currency}
            presetStudent={{
              id: s.student.id,
              name,
              rollNo: s.student.rollNo,
              className: s.className ?? "—",
              fee: Number(s.fee ?? 0),
            }}
          />
        </Card>
      </div>
    </div>
  );
}

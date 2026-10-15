import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { db } from "@/db";
import { payments, students } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import ReceiptActions from "@/components/ReceiptActions";
import { Card } from "@/components/ui";
import ContactMenu from "@/components/ContactMenu";
import { money, monthLabel, formatDateTime, num } from "@/lib/format";
import { amountInWords } from "@/lib/words";
import { displayPhone } from "@/lib/phone";
import { receiptMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const settings = await getSettings();
  const paymentId = Number(id);
  if (!Number.isInteger(paymentId)) notFound();

  const [p] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!p) notFound();

  const [student] = await db
    .select({ rollNo: students.rollNo, parentPhone: students.parentPhone, parentName: students.parentName })
    .from(students)
    .where(eq(students.id, p.studentId))
    .limit(1);

  const amount = num(p.amount);
  const shareMessage = receiptMessage(settings.language, {
    schoolName: settings.schoolName,
    receiptNo: p.receiptNo,
    studentName: p.studentName,
    rollNo: student?.rollNo,
    amount: money(amount, settings.currency),
    month: monthLabel(p.forMonth),
    method: p.method,
    date: formatDateTime(p.createdAt),
  });

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/payments"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="size-4" /> Back to payments
        </Link>
        <ReceiptActions />
      </div>

      <Card className="print-area overflow-hidden">
        <div className="h-1.5 bg-aqua-500" />
        <div className="p-6 sm:p-10">
          {/* Letterhead */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3.5">
              {settings.logoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoData} alt="School logo" className="size-14 rounded-xl bg-white object-contain" />
              ) : (
                <div className="grid size-14 place-items-center rounded-xl bg-primary-600 text-white">
                  <GraduationCap className="size-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">{settings.schoolName}</h1>
                <p className="text-xs leading-relaxed text-slate-500">
                  {[settings.address, settings.phone, settings.email].filter(Boolean).join(" · ") || "School fee receipt"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-aqua-700">Official Receipt</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">{p.receiptNo}</p>
              <p className="text-xs text-slate-500">{formatDateTime(p.createdAt)}</p>
            </div>
          </div>

          {/* Body */}
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Received from</dt>
              <dd className="mt-1 text-base font-bold text-slate-900">{p.studentName}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Roll № / Class</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {student?.rollNo ?? "—"} · {p.className || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fee month</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{monthLabel(p.forMonth)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment method</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{p.method}</dd>
            </div>
            {p.receivedBy && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Received by</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{p.receivedBy}</dd>
              </div>
            )}
            {p.note && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note</dt>
                <dd className="mt-1 text-sm text-slate-700">{p.note}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount paid</p>
              <p className="text-3xl font-bold tracking-tight text-aqua-700">{money(amount, settings.currency)}</p>
            </div>
            <p className="mt-2 text-sm italic text-slate-600">
              {amountInWords(amount)} {settings.currency} only
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-6">
            <div className="text-xs leading-relaxed text-slate-500">
              {settings.receiptFooter || "Thank you for your payment."}
              <p className="mt-1">This receipt was generated by DugsiPAY.</p>
            </div>
            <div className="w-40 text-center">
              <div className="border-b border-slate-300 pb-6" />
              <p className="mt-1.5 text-[11px] font-semibold text-slate-500">Authorized signature</p>
            </div>
          </div>
        </div>
      </Card>

      {/* WhatsApp sharing — honest behaviour */}
      <Card className="no-print mt-5 p-5">
        <h2 className="text-sm font-bold text-slate-900">Share on WhatsApp</h2>
        {student?.parentPhone ? (
          <>
            <p className="mt-1 text-sm text-slate-600">
              Send this receipt summary to {student.parentName || "the parent"} at{" "}
              <span className="font-semibold">{displayPhone(student.parentPhone)}</span>.
            </p>
            <div className="mt-3">
              <ContactMenu
                phone={student.parentPhone}
                message={shareMessage}
                label="Share receipt (WhatsApp / SMS)"
              />
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
              Buttons open WhatsApp (app or web) or your SMS app with the receipt text pre-filled — you review and
              press send yourself. DugsiPAY never sends messages automatically, and opening a chat does not mean the
              message was delivered.
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            No parent phone number is recorded for this student — add one on the student profile to share receipts on WhatsApp.
          </p>
        )}
      </Card>
    </div>
  );
}

import Link from "next/link";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { Filter, Plus, Trash2 } from "lucide-react";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import PaymentForm from "@/components/PaymentForm";
import ConfirmAction from "@/components/ConfirmAction";
import { deletePayment } from "@/lib/actions/payments";
import { Badge, Card, EmptyState, PageHeader, btnGhost, cn, inputCls } from "@/components/ui";
import { PAYMENT_METHODS, formatDate, money, monthLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const month = typeof sp.month === "string" ? sp.month : "";
  const method = typeof sp.method === "string" ? sp.method : "";
  const q = (typeof sp.q === "string" ? sp.q : "").trim();

  const conds: SQL[] = [];
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    conds.push(sql`${payments.createdAt} >= ${new Date(y, m - 1, 1)} and ${payments.createdAt} < ${new Date(y, m, 1)}`);
  }
  if (method) conds.push(eq(payments.method, method));
  if (q) {
    const like = `%${q}%`;
    conds.push(or(ilike(payments.studentName, like), ilike(payments.receiptNo, like))!);
  }
  const where = conds.length ? and(...conds) : undefined;

  const rows = await db
    .select()
    .from(payments)
    .where(where)
    .orderBy(desc(payments.createdAt), desc(payments.id))
    .limit(200);

  const total = rows.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      <PageHeader title="Payments" subtitle={`${rows.length} record${rows.length === 1 ? "" : "s"} shown`} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="h-fit scroll-mt-20 p-5 lg:sticky lg:top-6 lg:order-2">
          <h2 id="record" className="mb-1 flex scroll-mt-20 items-center gap-2 text-sm font-bold text-slate-900">
            <Plus className="size-4 text-aqua-600" /> Record a payment
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Search a student by name or roll number — the class fee auto-fills.
          </p>
          <PaymentForm currency={settings.currency} />
        </Card>

        <div className="space-y-4 lg:col-span-2 lg:order-1">
          <Card className="p-4">
            <form className="flex flex-wrap items-end gap-2" action="/payments" method="get">
              <div className="w-[calc(50%-4px)] sm:w-auto">
                <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="pmonth">Month</label>
                <input id="pmonth" type="month" name="month" defaultValue={month} className={cn(inputCls, "sm:w-40")} />
              </div>
              <div className="w-[calc(50%-4px)] sm:w-auto">
                <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="pmethod">Method</label>
                <select id="pmethod" name="method" defaultValue={method} className={cn(inputCls, "sm:w-36")}>
                  <option value="">All</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 flex-1 basis-full sm:basis-40">
                <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="pq">Search</label>
                <input id="pq" name="q" defaultValue={q} placeholder="Student name or receipt №…" className={inputCls} />
              </div>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 sm:flex-none"
              >
                <Filter className="size-4" /> Apply
              </button>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-900">Records</h2>
              <Badge tone="aqua">Total: {money(total, settings.currency)}</Badge>
            </div>
            {rows.length === 0 ? (
              <EmptyState title="No payments found" hint="Adjust your filters or record a new payment." />
            ) : (
              <>
                {/* Mobile cards */}
                <ul className="divide-y divide-slate-100 lg:hidden">
                  {rows.map((p) => (
                    <li key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/students/${p.studentId}`} className="block truncate text-sm font-semibold text-slate-900">
                            {p.studentName}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {p.className} · {formatDate(p.createdAt)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-slate-900">{money(p.amount, settings.currency)}</p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone="slate">{p.method}</Badge>
                        <Badge tone="primary">{monthLabel(p.forMonth)}</Badge>
                        <Link
                          href={`/receipts/${p.id}`}
                          className="ml-auto font-mono text-xs font-semibold text-primary-600 hover:underline"
                        >
                          {p.receiptNo}
                        </Link>
                        <ConfirmAction
                          danger
                          title={`Delete ${p.receiptNo}?`}
                          body={`This removes the ${money(p.amount, settings.currency)} payment recorded for ${p.studentName}. The deletion is logged in Activity.`}
                          confirmLabel="Delete payment"
                          successMessage="Payment deleted (logged)"
                          action={async () => deletePayment(p.id)}
                          trigger={
                            <button
                              type="button"
                              className={cn(btnGhost, "text-danger-500 hover:bg-danger-50 hover:text-danger-600")}
                              title="Delete payment"
                              aria-label={`Delete payment ${p.receiptNo}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3 font-semibold">Receipt</th>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Student</th>
                        <th className="px-5 py-3 font-semibold">Month</th>
                        <th className="px-5 py-3 font-semibold">Method</th>
                        <th className="px-5 py-3 text-right font-semibold">Amount</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rows.map((p) => (
                        <tr key={p.id} className="group transition hover:bg-slate-50/60">
                          <td className="px-5 py-3">
                            <Link href={`/receipts/${p.id}`} className="font-mono text-xs font-semibold text-primary-600 hover:underline">
                              {p.receiptNo}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{formatDate(p.createdAt)}</td>
                          <td className="px-5 py-3">
                            <Link href={`/students/${p.studentId}`} className="font-semibold text-slate-900 hover:text-primary-600">
                              {p.studentName}
                            </Link>
                            <p className="text-xs text-slate-400">{p.className}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{monthLabel(p.forMonth)}</td>
                          <td className="px-5 py-3">
                            <Badge tone="slate">{p.method}</Badge>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900">
                            {money(p.amount, settings.currency)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="opacity-0 transition group-hover:opacity-100">
                              <ConfirmAction
                                danger
                                title={`Delete ${p.receiptNo}?`}
                                body={`This removes the ${money(p.amount, settings.currency)} payment recorded for ${p.studentName}. The deletion is logged in Activity.`}
                                confirmLabel="Delete payment"
                                action={async () => deletePayment(p.id)}
                                trigger={
                                  <button
                                    type="button"
                                    className={cn(btnGhost, "text-danger-500 hover:bg-danger-50 hover:text-danger-600")}
                                    title="Delete payment"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                }
                              />
                            </div>
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
      </div>
    </div>
  );
}

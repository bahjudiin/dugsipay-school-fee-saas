"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { recordPayment } from "@/lib/actions/payments";
import type { FormState } from "@/lib/actions/types";
import { toast } from "@/components/Toast";
import StudentSearch from "@/components/StudentSearch";
import { Alert, Field, btnPrimary, cn, inputCls, inputErrorCls } from "@/components/ui";
import { PAYMENT_METHODS, currentYearMonth, money } from "@/lib/format";

export default function PaymentForm({
  currency,
  presetStudent,
  receivedByDefault,
}: {
  currency: string;
  presetStudent?: { id: number; name: string; rollNo: string; className: string; fee: number };
  receivedByDefault?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(recordPayment, {});
  const [amount, setAmount] = useState(presetStudent ? String(presetStudent.fee || "") : "");
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      toast({ title: "Payment recorded", description: "Opening the receipt…" });
      router.refresh();
      if (state.id) router.push(`/receipts/${state.id}`);
    } else if (state.error) {
      toast({ type: "error", title: "Couldn't record payment", description: state.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" id="record">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      {presetStudent ? (
        <>
          <input type="hidden" name="studentId" value={presetStudent.id} />
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-aqua-500 text-xs font-bold text-white">
              {presetStudent.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{presetStudent.name}</p>
              <p className="text-xs text-slate-500">
                {presetStudent.rollNo} · {presetStudent.className} · fee {money(presetStudent.fee, currency)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <Field label="Student" required error={state.fieldErrors?.studentId}>
          <StudentSearch
            currency={currency}
            onSelect={(s) => s && setAmount(String(s.fee || ""))}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" required error={state.fieldErrors?.amount} hint={`Currency: ${currency}`}>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={cn(inputCls, state.fieldErrors?.amount && inputErrorCls)}
          />
        </Field>
        <Field label="Method">
          <select name="method" defaultValue="Cash" className={inputCls}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="For month" error={state.fieldErrors?.forMonth} hint="Optional — which fee month this covers.">
          <input
            name="forMonth"
            type="month"
            defaultValue={currentYearMonth()}
            className={inputCls}
          />
        </Field>
        <Field label="Received by">
          <input
            name="receivedBy"
            defaultValue={receivedByDefault ?? ""}
            placeholder="e.g. Cashier name"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Note">
        <input name="note" placeholder="Optional note…" className={inputCls} />
      </Field>

      <button type="submit" className={cn(btnPrimary, "w-full")} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Record payment
      </button>
    </form>
  );
}

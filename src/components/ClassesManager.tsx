"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { addClass, deleteClass, updateClass } from "@/lib/actions/settings-actions";
import type { FormState } from "@/lib/actions/types";
import ConfirmAction from "@/components/ConfirmAction";
import { toast } from "@/components/Toast";
import { Alert, btnGhost, cn, inputCls } from "@/components/ui";
import { money } from "@/lib/format";

function AddClassForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addClass, {});
  useEffect(() => {
    if ((state as FormState & { name?: string }).ok) toast({ title: "Class added" });
    else if (state.error) toast({ type: "error", title: "Couldn't add class", description: state.error });
  }, [state]);
  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <div className="min-w-44 flex-1">
        <input name="name" placeholder="New class name, e.g. Grade 5" className={cn(inputCls, state.fieldErrors?.name && "border-red-400")} />
      </div>
      <div className="w-36">
        <input name="monthlyFee" type="number" min="0" step="0.01" placeholder="Monthly fee" className={cn(inputCls, state.fieldErrors?.monthlyFee && "border-red-400")} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add class
      </button>
      {state.error && <p className="w-full text-xs font-medium text-red-600">{state.error}</p>}
    </form>
  );
}

function ClassRow({
  id,
  name,
  fee,
  currency,
}: {
  id: number;
  name: string;
  fee: string;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateClass.bind(null, id), {});
  const router = useRouter();
  useEffect(() => {
    if (state.ok) toast({ title: "Class updated" });
    else if (state.error) toast({ type: "error", title: "Couldn't update class", description: state.error });
  }, [state]);

  return (
    <li className="flex flex-col gap-2 px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <form action={formAction} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <input name="name" defaultValue={name} className={cn(inputCls, "w-44")} aria-label="Class name" />
          <input
            name="monthlyFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={fee}
            className={cn(inputCls, "w-32")}
            aria-label={`Monthly fee in ${currency}`}
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-aqua-500 px-3 py-2 text-xs font-bold text-white hover:bg-aqua-600 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            Save
          </button>
        </form>
        <span className="hidden text-xs text-slate-400 sm:block">{money(fee, currency)}/mo</span>
        <ConfirmAction
          danger
          title={`Delete class "${name}"?`}
          body="Classes that still contain students cannot be deleted — move those students to another class first."
          confirmLabel="Delete class"
          successMessage="Class deleted"
          action={async () => {
            const r = await deleteClass(id);
            router.refresh();
            return r;
          }}
          trigger={
            <button type="button" className={cn(btnGhost, "text-danger-500 hover:bg-danger-50 hover:text-danger-600")} title="Delete class">
              <Trash2 className="size-4" />
            </button>
          }
        />
      </div>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <p className="text-xs font-medium text-emerald-600">Saved.</p>}
    </li>
  );
}

export default function ClassesManager({
  classes,
  currency,
}: {
  classes: { id: number; name: string; monthlyFee: string }[];
  currency: string;
}) {
  return (
    <div>
      <div className="border-b border-slate-100 p-5">
        <AddClassForm />
      </div>
      {classes.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          No classes yet — add your first class above (e.g. <em>Grade 1</em>, <em>Form 4</em>).
        </p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {classes.map((c) => (
            <ClassRow key={c.id} id={c.id} name={c.name} fee={c.monthlyFee} currency={currency} />
          ))}
        </ul>
      )}
    </div>
  );
}

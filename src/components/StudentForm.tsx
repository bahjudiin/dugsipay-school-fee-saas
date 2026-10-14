"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";
import { createStudent, peekNextRollNo, updateStudent } from "@/lib/actions/students";
import type { FormState } from "@/lib/actions/types";
import { toast } from "@/components/Toast";
import { Alert, Field, btnPrimary, btnSecondary, cn, inputCls, inputErrorCls } from "@/components/ui";

export type StudentFormValues = {
  id?: number;
  rollNo?: string;
  firstName?: string;
  lastName?: string;
  classId?: number;
  gender?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
};

export default function StudentForm({
  classes,
  initial,
  phoneHint,
}: {
  classes: { id: number; name: string; monthlyFee: string }[];
  initial?: StudentFormValues;
  phoneHint: string;
}) {
  const isEdit = !!initial?.id;
  const action = isEdit ? updateStudent.bind(null, initial!.id!) : createStudent;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [autoRoll, setAutoRoll] = useState(!initial?.rollNo);
  const [rollValue, setRollValue] = useState(initial?.rollNo ?? "");
  const [previewRoll, setPreviewRoll] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isEdit) peekNextRollNo().then(setPreviewRoll).catch(() => {});
  }, [isEdit]);

  useEffect(() => {
    if (state.ok && state.id) {
      toast({
        title: isEdit ? "Student updated" : "Student added",
        description: isEdit ? "Changes saved — payment history untouched." : "Opening the student profile…",
      });
      router.push(`/students/${state.id}`);
      router.refresh();
    } else if (state.error) {
      toast({ type: "error", title: "Couldn't save student", description: state.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">Saved successfully. Redirecting…</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Roll number"
          error={state.fieldErrors?.rollNo}
          hint={
            autoRoll && previewRoll
              ? `Will be assigned automatically${previewRoll ? ` (next: ${previewRoll})` : ""}.`
              : "Unique per student."
          }
        >
          <div className="flex gap-2">
            <input
              name="rollNo"
              value={autoRoll ? "" : rollValue}
              onChange={(e) => setRollValue(e.target.value)}
              placeholder={isEdit ? "Roll number" : "Auto on save"}
              disabled={autoRoll && !isEdit}
              className={cn(inputCls, state.fieldErrors?.rollNo && inputErrorCls, autoRoll && !isEdit && "bg-slate-50 text-slate-400")}
            />
            {!isEdit && (
              <button
                type="button"
                onClick={() => setAutoRoll((v) => !v)}
                className={cn(btnSecondary, "shrink-0 px-3")}
                title={autoRoll ? "Enter roll number manually" : "Switch to automatic"}
              >
                <Wand2 className={cn("size-4", autoRoll && "text-aqua-600")} />
                {autoRoll ? "Auto" : "Manual"}
              </button>
            )}
          </div>
          {autoRoll && !isEdit && <input type="hidden" name="rollNo" value="" />}
        </Field>

        <Field label="Class" required error={state.fieldErrors?.classId}>
          <select
            name="classId"
            defaultValue={initial?.classId ?? ""}
            className={cn(inputCls, state.fieldErrors?.classId && inputErrorCls)}
          >
            <option value="">Select class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="First name" required error={state.fieldErrors?.firstName}>
          <input
            name="firstName"
            defaultValue={initial?.firstName ?? ""}
            placeholder="e.g. Amina"
            className={cn(inputCls, state.fieldErrors?.firstName && inputErrorCls)}
          />
        </Field>

        <Field label="Last name" error={state.fieldErrors?.lastName}>
          <input
            name="lastName"
            defaultValue={initial?.lastName ?? ""}
            placeholder="e.g. Yusuf"
            className={inputCls}
          />
        </Field>

        <Field label="Gender">
          <select name="gender" defaultValue={initial?.gender ?? ""} className={inputCls}>
            <option value="">—</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </Field>

        <Field label="Parent / guardian name">
          <input
            name="parentName"
            defaultValue={initial?.parentName ?? ""}
            placeholder="e.g. Hodan Yusuf"
            className={inputCls}
          />
        </Field>

        <Field
          label="Parent WhatsApp / phone"
          error={state.fieldErrors?.parentPhone}
          hint={phoneHint}
        >
          <input
            name="parentPhone"
            defaultValue={initial?.parentPhone ?? ""}
            placeholder="+252 61 234 5678"
            className={cn(inputCls, state.fieldErrors?.parentPhone && inputErrorCls)}
            inputMode="tel"
          />
        </Field>

        <Field label="Notes" className="sm:col-span-2">
          <textarea
            name="notes"
            defaultValue={initial?.notes ?? ""}
            rows={2}
            placeholder="Optional notes…"
            className={inputCls}
          />
        </Field>
      </div>

      {classes.length === 0 && (
        <Alert tone="warn">
          You need at least one class before adding students — create classes in Settings first.
        </Alert>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 pt-5">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {isEdit ? "Save changes" : "Add student"}
        </button>
        <button type="button" className={btnSecondary} onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

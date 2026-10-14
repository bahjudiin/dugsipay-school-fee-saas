"use client";

import { useActionState, useEffect, useState, useTransition, useRef } from "react";
import { Copy, KeyRound, Loader2, UserPlus, UserX, UserCheck } from "lucide-react";
import {
  createStaff,
  listStaff,
  resetStaffPassword,
  setStaffActive,
} from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/types";
import ConfirmAction from "@/components/ConfirmAction";
import { toast } from "@/components/Toast";
import { Alert, Badge, Field, btnGhost, btnPrimary, cn, inputCls, inputErrorCls } from "@/components/ui";

type StaffUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

function TempPasswordNotice({ password, onClose }: { password: string; onClose: () => void }) {
  return (
    <Alert tone="success">
      Account created. Temporary password (shown once):
      <span className="mx-1.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-[13px] font-bold text-slate-900 ring-1 ring-slate-200">
        {password}
      </span>
      <button
        type="button"
        className="font-semibold underline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(password);
            toast({ title: "Password copied" });
          } catch {}
        }}
      >
        <Copy className="inline size-3.5" /> Copy
      </button>
      <button type="button" onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
    </Alert>
  );
}

export default function StaffManager() {
  const [rows, setRows] = useState<StaffUser[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [state, formAction, adding] = useActionState<FormState & { tempPassword?: string }, FormData>(
    createStaff,
    {},
  );
  const tempPwRef = useRef<string | null>(null);

  function refresh() {
    startTransition(async () => {
      const res = await listStaff();
      if (Array.isArray(res)) setRows(res);
      else setLoadError(res.error);
    });
  }
  useEffect(refresh, []);

  useEffect(() => {
    if (state.ok && state.tempPassword && tempPwRef.current === null) {
      tempPwRef.current = state.tempPassword;
      setTempPw(state.tempPassword);
      toast({ title: "Staff account created", description: "Share the temporary password securely." });
      refresh();
    } else if (state.error) {
      toast({ type: "error", title: "Couldn't add staff", description: state.error });
    }
  }, [state, tempPwRef]);

  return (
    <div className="space-y-5">
      <form action={formAction} className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <Field label="Name" required error={state.fieldErrors?.name}>
            <input name="name" placeholder="e.g. Amina — Secretary" className={cn(inputCls, state.fieldErrors?.name && inputErrorCls)} />
          </Field>
        </div>
        <div className="sm:col-span-1">
          <Field label="Email" required error={state.fieldErrors?.email}>
            <input name="email" type="email" placeholder="staff@school.so" className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)} />
          </Field>
        </div>
        <Field label="Role">
          <select name="role" className={inputCls} defaultValue="staff">
            <option value="staff">Staff — students & payments</option>
            <option value="admin">Admin — everything incl. settings</option>
          </select>
        </Field>
        <div className="flex items-end">
          <button type="submit" disabled={adding || pending} className={cn(btnPrimary, "w-full")}>
            {adding ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Add staff
          </button>
        </div>
      </form>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {tempPw && <TempPasswordNotice password={tempPw} onClose={() => setTempPw(null)} />}
      {loadError && <Alert tone="warn">{loadError}</Alert>}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {rows.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
              {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
              <p className="truncate text-xs text-slate-500">{u.email}</p>
            </div>
            <Badge tone={u.role === "owner" ? "primary" : u.role === "admin" ? "aqua" : "slate"}>{u.role}</Badge>
            {!u.active && <Badge tone="red">deactivated</Badge>}
            <div className="flex items-center gap-1">
              {u.role !== "owner" && (
                <>
                  <ConfirmAction
                    title={`Reset password for ${u.name}?`}
                    body="A new temporary password will be shown to you once. Their current sessions are signed out."
                    confirmLabel="Reset password"
                    action={async () => resetStaffPassword(u.id)}
                    onDone={(r) => {
                      const tp = r && "tempPassword" in (r as object) ? (r as { tempPassword?: string }).tempPassword : undefined;
                      if (tp) setTempPw(tp);
                    }}
                    trigger={
                      <button type="button" className={btnGhost} title="Reset password">
                        <KeyRound className="size-4" />
                      </button>
                    }
                  />
                  <ConfirmAction
                    danger={u.active}
                    title={u.active ? `Deactivate ${u.name}?` : `Reactivate ${u.name}?`}
                    body={
                      u.active
                        ? "They will immediately lose access. You can reactivate anytime."
                        : "They will be able to log in again."
                    }
                    confirmLabel={u.active ? "Deactivate" : "Reactivate"}
                    action={async () => setStaffActive(u.id, !u.active)}
                    onDone={refresh}
                    trigger={
                      <button
                        type="button"
                        className={cn(btnGhost, u.active && "text-danger-500 hover:bg-danger-50")}
                        title={u.active ? "Deactivate" : "Reactivate"}
                      >
                        {u.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                      </button>
                    }
                  />
                </>
              )}
            </div>
          </li>
        ))}
        {rows.length === 0 && !loadError && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">
            {pending ? "Loading…" : "Only the owner account exists so far."}
          </li>
        )}
      </ul>
      <p className="text-[11px] leading-relaxed text-slate-400">
        Roles: <b>Owner</b> & <b>Admin</b> can manage settings, classes, staff, deletions and backups.{" "}
        <b>Staff</b> can register students, record payments, import CSV and send reminders. The demo
        role sees everything but cannot change anything.
      </p>
    </div>
  );
}

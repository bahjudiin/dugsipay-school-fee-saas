"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signupOwner,
} from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/types";
import { toast } from "@/components/Toast";
import { Alert, Field, btnSecondary, cn, inputCls, inputErrorCls } from "@/components/ui";
import { useState } from "react";

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
      {children}
    </button>
  );
}

function PasswordInput({ error, autoComplete }: { error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name="password"
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder="••••••••"
        className={cn(inputCls, "pr-11", error && inputErrorCls)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function SignupFormAuth() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signupOwner, {});
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      toast({ title: "Workspace created", description: "Welcome to DuqsiPay." });
      router.replace("/dashboard");
      router.refresh();
    }
  }, [state, router]);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Your name" required error={state.fieldErrors?.name}>
        <input name="name" autoComplete="name" placeholder="e.g. Xasan Maxamed" className={cn(inputCls, state.fieldErrors?.name && inputErrorCls)} />
      </Field>
      <Field label="Email" required error={state.fieldErrors?.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@school.so" className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)} />
      </Field>
      <Field label="Password" required error={state.fieldErrors?.password} hint="Minimum 8 characters. Stored as a scrypt hash — never plaintext.">
        <PasswordInput error={state.fieldErrors?.password} autoComplete="new-password" />
      </Field>
      <SubmitButton pending={pending}>Create my workspace</SubmitButton>
    </form>
  );
}

export function LoginFormAuth() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(login, {});
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      toast({ title: "Welcome back" });
      router.replace("/dashboard");
      router.refresh();
    }
  }, [state, router]);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" required error={state.fieldErrors?.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@school.so" className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)} />
      </Field>
      <Field label="Password" required>
        <PasswordInput autoComplete="current-password" />
      </Field>
      <SubmitButton pending={pending}>Log in</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState & { devLink?: string }, FormData>(
    requestPasswordReset,
    {},
  );
  useEffect(() => {
    if (state.ok) toast({ title: "Check your inbox", description: "If the email exists, a reset link is on its way." });
    else if (state.error) toast({ type: "error", title: "Couldn't send reset", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && (
        <Alert tone="success">
          If an account exists for that email, a reset link has been sent (valid 30 minutes).
          {state.devLink && (
            <>
              {" "}
              Dev mode — your link:{" "}
              <a className="font-semibold underline" href={state.devLink}>
                Reset password
              </a>
            </>
          )}
        </Alert>
      )}
      <Field label="Account email" required error={state.fieldErrors?.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@school.so" className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)} />
      </Field>
      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(resetPassword, {});
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      toast({ title: "Password updated", description: "Log in with your new password." });
      router.replace("/login");
    }
  }, [state, router]);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" required error={state.fieldErrors?.password} hint="Minimum 8 characters. Old sessions are signed out for safety.">
        <PasswordInput error={state.fieldErrors?.password} autoComplete="new-password" />
      </Field>
      <SubmitButton pending={pending}>Set new password</SubmitButton>
      <a href="/login" className={cn(btnSecondary, "w-full")}>Back to login</a>
    </form>
  );
}

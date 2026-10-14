"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "@/components/Toast";
import { btnDanger, btnPrimary, btnSecondary, cn } from "@/components/ui";

type Result = { ok?: boolean; error?: string } | void;

/**
 * Reusable confirmation modal around a server action.
 * Shows server-returned errors inside the modal so safe-delete guards
 * (e.g. "student has payments") are visible instead of silently failing.
 */
export default function ConfirmAction({
  trigger,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  action,
  onDone,
  successMessage,
}: {
  trigger: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  action: () => Promise<Result>;
  onDone?: (r: Result) => void;
  successMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        const err = result && result !== null && "error" in (result as object) ? (result as { error?: string }).error : undefined;
        if (err) {
          setError(err);
          return;
        }
        setOpen(false);
        if (successMessage) toast({ title: successMessage });
        onDone?.(result);
        router.refresh();
      } catch {
        setError("The server didn't respond — please refresh the page and try again.");
      }
    });
  }

  return (
    <>
      <span onClick={() => { setError(null); setOpen(true); }} className="inline-flex">
        {trigger}
      </span>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-primary-950/60 backdrop-blur-[2px]"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative w-full max-w-md animate-fade-up rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => !pending && setOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div
              className={cn(
                "mb-4 grid size-11 place-items-center rounded-xl",
                danger ? "bg-danger-50 text-danger-500" : "bg-primary-50 text-primary-600",
              )}
            >
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            {body && <div className="mt-2 text-sm leading-relaxed text-slate-600">{body}</div>}
            {error && (
              <div className="mt-4 rounded-xl border border-danger-100 bg-danger-50 px-3.5 py-2.5 text-[13px] font-medium text-danger-600">
                {error}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={danger ? cn(btnDanger, "border-danger-500 bg-danger-500 text-white hover:bg-danger-600") : btnPrimary}
                onClick={run}
                disabled={pending}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

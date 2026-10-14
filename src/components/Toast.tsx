"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/components/ui";

export type ToastKind = "success" | "error" | "info";
export type ToastPayload = { title: string; description?: string; type?: ToastKind };

type ToastItem = ToastPayload & { id: number; exiting?: boolean };

type Listener = (t: ToastPayload) => void;
const listeners = new Set<Listener>();

/** Call from ANY component: toast({ title: "Saved" }) — no context needed. */
export function toast(payload: ToastPayload) {
  listeners.forEach((l) => l(payload));
}

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 shrink-0 text-aqua-500" />,
  error: <XCircle className="size-5 shrink-0 text-danger-500" />,
  info: <Info className="size-5 shrink-0 text-primary-500" />,
};

let nextId = 1;

export default function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (payload) => {
      const id = nextId++;
      setItems((prev) => [...prev.slice(-3), { ...payload, id }]);
      // auto-dismiss
      setTimeout(() => {
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
        setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 190);
      }, 3800);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  function dismiss(id: number) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 190);
  }

  if (!items.length) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
    >
      {items.map((t) => {
        const type = t.type ?? "success";
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur",
              t.exiting ? "toast-exit" : "toast-enter",
            )}
            role="status"
          >
            {ICONS[type]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="grid size-6 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

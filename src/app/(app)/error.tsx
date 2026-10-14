"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-danger-50 text-danger-500">
        <TriangleAlert className="size-7" />
      </div>
      <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        The page hit an unexpected error. Your data is safe — no information was lost.
        {error.digest && (
          <span className="mt-1 block text-xs text-slate-400">Error reference: {error.digest}</span>
        )}
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={reset} className={btnPrimary}>
          Try again
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/dashboard" className={btnSecondary}>
          Go to dashboard
        </a>
      </div>
    </div>
  );
}

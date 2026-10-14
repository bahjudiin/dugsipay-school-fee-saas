"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";
import { btnSecondary, cn } from "@/components/ui";

export default function ReceiptActions() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — select fallback silently.
      window.prompt("Copy this link:", window.location.href);
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => window.print()} className={btnSecondary}>
        <Printer className="size-4" /> Print / Save PDF
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={cn(btnSecondary, copied && "border-emerald-300 text-emerald-700")}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Copied!" : "Copy receipt link"}
      </button>
    </div>
  );
}

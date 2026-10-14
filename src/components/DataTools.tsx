"use client";

import { useState, useCallback } from "react";
import { DatabaseBackup, Eraser, FlaskConical } from "lucide-react";
import { generateDemoData, purgeDemoData } from "@/lib/actions/settings-actions";
import ConfirmAction from "@/components/ConfirmAction";
import { toast } from "@/components/Toast";
import { Alert, btnSecondary, cn } from "@/components/ui";

export default function DataTools() {
  const [message, setMessage] = useState<string | null>(null);

  const handleDownload = useCallback(() => {
    const timestamp = String(Date.now());
    const link = document.createElement("a");
    link.href = `/api/backup?t=${timestamp}`;
    link.target = "_blank";
    link.click();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Backup & recovery checkpoint</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Download a complete JSON snapshot of settings, classes, students, payments and activity before making big changes.
          </p>
        </div>
        <button onClick={handleDownload} className={cn(btnSecondary, "shrink-0")}>
          <DatabaseBackup className="size-4" /> Download backup
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Sample data for demos</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Loads 26 flagged demo students (6 classes, ~3 months of payments) so you can explore every feature.
            Sample records are always marked as demo and can be removed with one click — real records are never touched.
          </p>
        </div>
        <ConfirmAction
          title="Load sample data?"
          body="26 demo students with realistic payments will be added. They are flagged as demo and will not interfere with your real records."
          confirmLabel="Load sample data"
          action={async () => generateDemoData()}
          onDone={(r) => {
            if (r && "ok" in r && r.ok) {
              toast({ title: "Sample data loaded", description: "Explore everything, then clean up anytime." });
            }
            if (r && "ok" in r && r.ok)
              setMessage(`Loaded ${("loaded" in r && r.loaded) || 26} demo students with payments. Everything is now explorable — clean it up anytime below.`);
          }}
          trigger={
            <button type="button" className={cn(btnSecondary, "shrink-0 border-primary-200 text-primary-700 hover:bg-primary-100")}>
              <FlaskConical className="size-4" /> Load sample data
            </button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Remove demo records</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Deletes only records explicitly flagged as demo (students + their payments). Real students and payment history are never touched.
          </p>
        </div>
        <ConfirmAction
          danger
          title="Remove demo records?"
          body="Every record flagged as demo (and its payments) will be permanently deleted. All real student and payment records stay untouched. This action is logged."
          confirmLabel="Remove demo data"
          action={async () => {
            const r = await purgeDemoData();
            if (r.ok) toast({ title: "Demo data removed", description: "Real records were untouched." });
            if (r.ok) setMessage(r.removed ? `Removed ${r.removed} demo record${r.removed === 1 ? "" : "s"}.` : "No demo records were found — nothing to remove.");
            return r;
          }}
          trigger={
            <button type="button" className={cn(btnSecondary, "shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100")}>
              <Eraser className="size-4" /> Clean demo data
            </button>
          }
        />
      </div>

      {message && <Alert tone="success">{message}</Alert>}
    </div>
  );
}

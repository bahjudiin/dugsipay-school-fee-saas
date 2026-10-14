"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  RotateCcw,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { IMPORT_HEADERS, parseCsv } from "@/lib/csv";
import {
  commitImport,
  validateImport,
  type ImportResult,
  type ImportRow,
  type RowValidation,
} from "@/lib/actions/import";
import { Alert, Badge, Card, btnPrimary, btnSecondary, cn, inputCls } from "@/components/ui";
import { toast } from "@/components/Toast";

const STEPS = ["Template", "Your data", "Validate & preview", "Summary"] as const;

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export default function ImportWizard({
  classNames,
}: {
  classNames: string[];
}) {
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [excludedCount, setExcludedCount] = useState(0);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [validations, setValidations] = useState<RowValidation[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedCount = useMemo(
    () => selected.filter((s, i) => s && validations[i]?.valid).length,
    [selected, validations],
  );
  const validCount = validations.filter((v) => v.valid).length;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result ?? ""));
      setParseError(null);
    };
    reader.readAsText(file);
  }

  function parse() {
    setParseError(null);
    setExcludedCount(0);
    try {
      const grid = parseCsv(raw);
      if (grid.length < 2) {
        setParseError("The file needs a header row plus at least one student row.");
        return;
      }
      const headers = grid[0].map(normalizeHeader);
      const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
      if (idx.first_name === undefined || idx.class_name === undefined) {
        setParseError(
          `Could not find the required "first_name" and "class_name" columns. Expected headers: ${IMPORT_HEADERS.join(", ")}`,
        );
        return;
      }
      const get = (r: string[], key: string) => (idx[key] !== undefined ? (r[idx[key]] ?? "") : "");
      const parsed: ImportRow[] = [];
      let excluded = 0;
      for (const r of grid.slice(1)) {
        const row: ImportRow = {
          rollNo: get(r, "roll_no"),
          firstName: get(r, "first_name"),
          lastName: get(r, "last_name"),
          className: get(r, "class_name"),
          gender: get(r, "gender"),
          parentName: get(r, "parent_name"),
          parentPhone: get(r, "parent_phone"),
          notes: get(r, "notes"),
        };
        if (/example row/i.test(row.notes)) {
          excluded++;
          continue;
        }
        parsed.push(row);
      }
      if (!parsed.length) {
        setParseError("No student rows found (the template example row is excluded automatically).");
        return;
      }
      setRows(parsed);
      setExcludedCount(excluded);
      startTransition(async () => {
        try {
          const vals = await validateImport(parsed);
          if (!Array.isArray(vals)) throw new Error("bad response");
          setValidations(vals);
          setSelected(vals.map((v) => v.valid && !v.possibleDuplicate));
          setStep(2);
        } catch {
          setValidations([]);
          setSelected([]);
          toast({
            type: "error",
            title: "Validation failed",
            description: "The server couldn't validate the file — please refresh and try again.",
          });
        }
      });
    } catch {
      setParseError("Could not parse that file. Make sure it is valid CSV.");
    }
  }

  function toggleAllValid(checked: boolean) {
    setSelected(validations.map((v) => (v.valid ? checked : false)));
  }

  function doImport() {
    startTransition(async () => {
      try {
        const chosen = validations.filter((_, i) => selected[i]);
        const res = await commitImport(chosen);
        setResult(res);
        setStep(3);
        if (res.ok) toast({ title: `Import complete: ${res.imported} added`, description: res.failed ? `${res.failed} row${res.failed === 1 ? "" : "s"} failed — see summary.` : undefined });
        else toast({ type: "error", title: "Import failed", description: res.error });
      } catch {
        toast({
          type: "error",
          title: "Import failed",
          description: "The server didn't respond — please refresh the page and try again.",
        });
      }
    });
  }

  function reset() {
    setStep(0);
    setRaw("");
    setRows([]);
    setValidations([]);
    setSelected([]);
    setResult(null);
    setParseError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card className="overflow-hidden">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                i === step
                  ? "bg-primary-600 text-white"
                  : i < step
                    ? "bg-primary-50 text-primary-700"
                    : "bg-white text-slate-400 ring-1 ring-slate-200",
              )}
            >
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-full text-[10px] font-bold",
                  i === step ? "bg-white/20" : "bg-slate-100 text-slate-500",
                )}
              >
                {i < step ? <Check className="size-2.5" /> : i + 1}
              </span>
              {label}
            </span>
            {i < STEPS.length - 1 && <ArrowRight className="size-3.5 text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* STEP 1 — template */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">1 · Download the CSV template</h2>
              <p className="mt-1 text-sm text-slate-600">
                The template has the exact column headers the importer expects. Fill it in Excel or Google Sheets, then save/export as CSV.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/api/import-template" className={btnPrimary}>
                <Download className="size-4" /> Download template.csv
              </a>
              <div className="rounded-xl bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500 ring-1 ring-slate-100">
                {IMPORT_HEADERS.join(", ")}
              </div>
            </div>
            <Alert tone="info">
              Class names in the file must match your configured classes exactly (matching ignores case):{" "}
              <span className="font-semibold">{classNames.length ? classNames.join(" · ") : "none yet — create classes on the Classes page first"}</span>.
              Leave <span className="font-mono text-xs">roll_no</span> empty to auto-generate roll numbers.
            </Alert>
            <div className="flex justify-end">
              <button type="button" className={btnPrimary} onClick={() => setStep(1)} disabled={!classNames.length}>
                Next <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — data input */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">2 · Add your data</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Upload the filled CSV file, or paste its contents directly.
                </p>
              </div>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => fileRef.current?.click()}
              >
                <UploadCloud className="size-4" /> Choose file…
              </button>
              <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onFile} />
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={`roll_no,first_name,last_name,class_name,gender,parent_name,parent_phone,notes\n,Amina,Yusuf,${classNames[0] ?? "Grade 1"},Female,Hodan Yusuf,+252 61 234 5678,`}
              className={cn(inputCls, "font-mono text-xs leading-relaxed")}
            />
            {parseError && <Alert tone="error">{parseError}</Alert>}
            <div className="flex justify-between">
              <button type="button" className={btnSecondary} onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" /> Back
              </button>
              <button type="button" className={btnPrimary} onClick={parse} disabled={pending || !raw.trim()}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                Parse & validate
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — validation preview */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">3 · Review before importing</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {validations.length} rows · {validCount} valid · {validations.length - validCount} with errors
                  {excludedCount > 0 ? ` · ${excludedCount} template example row excluded` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={validCount > 0 && validations.every((v) => !v.valid || selected[validations.indexOf(v)])}
                  onChange={(e) => toggleAllValid(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-aqua-600 focus:ring-aqua-500"
                />
                Select all valid rows
              </label>
            </div>

            <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5"></th>
                    <th className="px-3 py-2.5 font-semibold">#</th>
                    <th className="px-3 py-2.5 font-semibold">Roll</th>
                    <th className="px-3 py-2.5 font-semibold">Name</th>
                    <th className="px-3 py-2.5 font-semibold">Class</th>
                    <th className="px-3 py-2.5 font-semibold">Parent phone</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validations.map((v, i) => (
                    <tr key={i} className={cn(!v.valid && "bg-red-50/40", v.valid && v.possibleDuplicate && "bg-amber-50/50")}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          disabled={!v.valid}
                          checked={!!selected[i] && v.valid}
                          onChange={(e) =>
                            setSelected((prev) => prev.map((s, j) => (j === i ? e.target.checked : s)))
                          }
                          className="size-4 rounded border-slate-300 text-aqua-600 focus:ring-aqua-500 disabled:opacity-40"
                          aria-label={`Select row ${i + 1}`}
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">
                        {v.row.rollNo || <span className="text-slate-400">auto</span>}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {v.row.firstName} {v.row.lastName}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{v.row.className}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {v.normalizedPhone ? `+${v.normalizedPhone}` : v.row.parentPhone || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {v.valid && !v.possibleDuplicate && <Badge tone="green">Ready</Badge>}
                        {v.valid && v.possibleDuplicate && (
                          <Badge tone="amber">
                            <AlertTriangle className="size-3" /> Possible duplicate
                          </Badge>
                        )}
                        {!v.valid && (
                          <div className="space-y-1">
                            <Badge tone="red">
                              <XCircle className="size-3" /> {v.errors.length} error{v.errors.length === 1 ? "" : "s"}
                            </Badge>
                            <p className="max-w-xs text-[11px] leading-snug text-red-600">{v.errors.join("; ")}</p>
                          </div>
                        )}
                        {v.warnings.length > 0 && (
                          <p className="mt-1 max-w-xs text-[11px] leading-snug text-amber-700">{v.warnings.join("; ")}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500">
              Rows with errors can’t be imported — fix them in your file and re-run, or import the valid rows now.
              Possible duplicates are deselected by default; tick them if they are genuinely different students
              (e.g. siblings sharing a parent phone).
            </p>

            <div className="flex justify-between">
              <button type="button" className={btnSecondary} onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" /> Edit data
              </button>
              <button type="button" className={btnPrimary} onClick={doImport} disabled={pending || selectedCount === 0}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Import {selectedCount} student{selectedCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — summary */}
        {step === 3 && result && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={cn("grid size-12 place-items-center rounded-2xl", result.ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                {result.ok ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {result.ok ? "Import complete" : "Import failed"}
                </h2>
                <p className="text-sm text-slate-600">{result.error ?? "Here is what happened:"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
                <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
                <p className="text-xs font-semibold text-emerald-800">Imported</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                <p className="text-2xl font-bold text-slate-700">{result.skipped}</p>
                <p className="text-xs font-semibold text-slate-600">Skipped / not selected</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center ring-1 ring-red-100">
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                <p className="text-xs font-semibold text-red-700">Failed</p>
              </div>
            </div>

            {result.failures.length > 0 && (
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-500">Failed rows</p>
                <ul className="space-y-1 text-sm text-red-700">
                  {result.failures.map((f, i) => (
                    <li key={i}>
                      <span className="font-semibold">{f.name}</span> — {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" className={btnSecondary} onClick={reset}>
                <RotateCcw className="size-4" /> Import another file
              </button>
              <Link href="/students" className={btnPrimary}>
                View students <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

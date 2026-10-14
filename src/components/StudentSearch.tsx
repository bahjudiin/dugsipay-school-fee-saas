"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { searchStudents } from "@/lib/actions/students";
import { cn, inputCls } from "@/components/ui";
import { money } from "@/lib/format";

type Hit = {
  id: number;
  name: string;
  rollNo: string;
  className: string;
  fee: number;
};

export default function StudentSearch({
  currency,
  onSelect,
  autoFocus,
}: {
  currency: string;
  onSelect?: (s: Hit | null) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Hit | null>(null);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        if (!q.trim()) {
          setHits([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        const res = await searchStudents(q);
        setHits(res);
        setHighlight(0);
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  function pick(s: Hit) {
    setSelected(s);
    setQ("");
    setOpen(false);
    onSelect?.(s);
  }

  function clear() {
    setSelected(null);
    setQ("");
    onSelect?.(null);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-aqua-200 bg-aqua-50 px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-aqua-500 text-xs font-bold text-white">
            {selected.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{selected.name}</p>
            <p className="text-xs text-slate-500">
              {selected.rollNo} · {selected.className} · fee {money(selected.fee, currency)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </button>
        <input type="hidden" name="studentId" value={selected.id} />
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      {loading && (
        <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
      )}
      <input
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, hits.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && hits[highlight]) {
            e.preventDefault();
            pick(hits[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Type a name or roll number…"
        className={`${inputCls} pl-10 pr-10`}
        role="combobox"
        aria-expanded={open}
        aria-label="Search student"
      />
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-300" />

      {open && q.trim() && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {hits.length === 0 && !loading ? (
            <p className="px-4 py-3 text-sm text-slate-500">No active students found for “{q}”.</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => pick(h)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition",
                      i === highlight ? "bg-aqua-50" : "hover:bg-slate-50",
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {h.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {h.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {h.rollNo} · {h.className}
                      </span>
                    </span>
                    {i === highlight && <Check className="size-4 text-aqua-600" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

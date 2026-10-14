"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { inputCls } from "@/components/ui";

export default function StudentsFilterBar({
  classes,
}: {
  classes: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q === current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q }), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or roll number…"
          className={`${inputCls} pl-10`}
          aria-label="Search students"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        <select
          className={`${inputCls} sm:w-44`}
          value={searchParams.get("classId") ?? ""}
          onChange={(e) => push({ classId: e.target.value })}
          aria-label="Filter by class"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={`${inputCls} sm:w-40`}
          value={searchParams.get("status") ?? "active"}
          onChange={(e) => push({ status: e.target.value })}
          aria-label="Filter by status"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All statuses</option>
        </select>
      </div>
    </div>
  );
}

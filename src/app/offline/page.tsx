import Link from "next/link";
import { GraduationCap, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-6 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-primary-800 text-white">
        <GraduationCap className="size-6" />
      </div>
      <div className="mt-6 grid size-12 place-items-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <WifiOff className="size-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">You’re offline</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        DuqsiPay needs a connection to load new data. Pages you’ve already opened may still work —
        otherwise check your internet and try again. / Internet lama heysan — isku xir markale.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
      >
        Try again
      </Link>
    </div>
  );
}

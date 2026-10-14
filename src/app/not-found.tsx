import Link from "next/link";
import { Compass } from "lucide-react";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary-600">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-950">Page not found</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <Link href="/dashboard" className={`${btnPrimary} mt-6`}>
        Back to dashboard
      </Link>
    </div>
  );
}

import Link from "next/link";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getRealAuthUser } from "@/lib/auth";
import { SignupFormAuth } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create your account" };

export default async function SignupPage() {
  // Sign-up creates the FIRST owner account of this workspace only.
  // The demo account (role=demo) never blocks owner registration.
  const user = await getRealAuthUser();
  if (user) redirect("/dashboard");

  const [{ count: realUsers }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`${users.role} <> 'demo'`);

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-6 sm:p-8">
      {realUsers === 0 ? (
        <>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">Create your school workspace</h1>
          <p className="mt-1 text-sm text-slate-500">
            This first account becomes the workspace owner. You can add staff later.
          </p>
          <div className="mt-6">
            <SignupFormAuth />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">An account already exists</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This workspace already has an owner account. Log in, or ask your admin to add you from
            Settings → Staff accounts.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            Go to login
          </Link>
        </>
      )}
      <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Log in
        </Link>
        {" · "}
        <Link href="/dashboard" className="font-semibold text-aqua-700 hover:underline">
          Open live demo (No login)
        </Link>
      </div>
    </div>
  );
}

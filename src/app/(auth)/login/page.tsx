import Link from "next/link";
import { redirect } from "next/navigation";
import { getRealAuthUser } from "@/lib/auth";
import { LoginFormAuth } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getRealAuthUser();
  if (user) redirect("/dashboard");

  const sp = await searchParams;
  const demoError = sp.demoError === "1";
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-6 sm:p-8">

      <h1 className="text-xl font-bold tracking-tight text-slate-950">Log in to your school</h1>
      <p className="mt-1 text-sm text-slate-500">Your students, payments and reports are waiting.</p>
      <div className="mt-6">
        <LoginFormAuth />
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-semibold text-primary-600 hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-semibold text-slate-500 hover:text-slate-800">
          Create account
        </Link>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
        Just exploring?{" "}
        <Link href="/dashboard" className="font-semibold text-aqua-700 hover:underline">
          Open the live demo (No login required)
        </Link>
      </div>
    </div>
  );
}

import { ResetPasswordForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-slate-950">Choose a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Reset links work once and expire after 30 minutes.</p>
      <div className="mt-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}

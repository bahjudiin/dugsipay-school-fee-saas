import Link from "next/link";
import { ForgotPasswordForm } from "@/components/AuthForms";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-slate-950">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter your account email and we’ll send a secure reset link (valid 30 minutes).
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

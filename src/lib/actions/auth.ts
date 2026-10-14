"use server";

import crypto from "node:crypto";
import { and, desc, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import {
  canAdmin,
  cleanupAuthTables,
  createSession,
  destroySession,
  getAuthUser,
  hashPassword,
  loginWithPassword,
  type AuthUser,
} from "@/lib/auth";
import type { FormState } from "@/lib/actions/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badCredentials(): FormState {
  return { error: "Incorrect email or password." };
}

/** First-run owner signup — closed as soon as a real (non-demo) account exists. */
export async function signupOwner(_prev: FormState, fd: FormData): Promise<FormState> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(ne(users.role, "demo"));
  if (count > 0) return { error: "An account already exists for this workspace. Please log in instead." };

  const name = str(fd, "name").slice(0, 100);
  const email = str(fd, "email").toLowerCase().slice(0, 160);
  const password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Your name is required.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < 8) fieldErrors.password = "At least 8 characters.";
  if (Object.keys(fieldErrors).length)
    return { error: "Please fix the highlighted fields.", fieldErrors };

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password), role: "owner" })
    .returning({ id: users.id });
  await createSession(user.id);
  return { ok: true };
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return badCredentials();

  const result = await loginWithPassword(email, password);
  if (!result.ok) return { error: result.error };

  await createSession(result.userId);
  cleanupAuthTables().catch(() => {});
  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/dashboard");
}

/** Password reset request — sends via Resend when configured; dev-link mode otherwise. */
export async function requestPasswordReset(
  _prev: FormState,
  fd: FormData,
): Promise<FormState & { devLink?: string }> {
  const email = str(fd, "email").toLowerCase().slice(0, 160);
  if (!EMAIL_RE.test(email))
    return { error: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address." } };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const genericOk: FormState = { ok: true };
  if (!user || !user.active) return genericOk; // never reveal account existence

  const token = crypto.randomBytes(32).toString("base64url");
  await db.insert(passwordResetTokens).values({
    tokenHash: sha256(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  const resetPath = `/reset-password?token=${token}`;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "DugsiPAY <onboarding@dugsipay.com>";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: email,
          subject: "Reset your DuqsiPay password",
          html: `<p>Salaam ${user.name || ""},</p><p>Click to reset your DuqsiPay password (valid 30 minutes):</p><p><a href="${appUrl}${resetPath}">Reset password</a></p><p>If you didn't request this, ignore this email.</p>`,
        }),
      });
      if (!res.ok) console.error("Resend failed:", await res.text());
    } catch (err) {
      console.error("Email send failed:", err);
    }
    return genericOk;
  }

  // No mailer configured — only expose the link when explicitly in dev mode.
  if (process.env.EMAIL_DEV_LINKS === "true") {
    return { ...genericOk, devLink: resetPath };
  }
  console.warn(`Password reset requested for ${email} but RESEND_API_KEY is not configured.`);
  return genericOk;
}

export async function resetPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token");
  const password = String(fd.get("password") ?? "");
  if (!token) return { error: "This reset link is invalid or was already used." };
  if (password.length < 8)
    return { error: "Choose a longer password.", fieldErrors: { password: "At least 8 characters." } };

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, sha256(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) return { error: "This reset link is invalid, expired, or was already used." };

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash: await hashPassword(password), failedAttempts: 0, lockedUntil: null })
      .where(eq(users.id, row.userId));
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, row.id));
    // Invalidate all sessions for safety after a password change.
    await tx.execute(sql`delete from sessions where user_id = ${row.userId}`);
  });
  return { ok: true };
}

/* ---------------- Staff management (owner/admin only) ---------------- */
async function requireAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  return canAdmin(user) ? user : null;
}

export async function listStaff(): Promise<
  { id: number; email: string; name: string; role: string; active: boolean; createdAt: string }[] | { error: string }
> {
  if (!(await requireAdminUser())) return { error: "Not authorized." };
  const rows = await db
    .select()
    .from(users)
    .where(ne(users.role, "demo"))
    .orderBy(desc(users.createdAt));
  return rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function createStaff(
  _prev: FormState,
  fd: FormData,
): Promise<FormState & { tempPassword?: string }> {
  if (!(await requireAdminUser())) return { error: "Only owners/admins can add staff." };
  const name = str(fd, "name").slice(0, 100);
  const email = str(fd, "email").toLowerCase().slice(0, 160);
  const role = str(fd, "role") === "admin" ? "admin" : "staff";
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email.";
  if (Object.keys(fieldErrors).length)
    return { error: "Please fix the highlighted fields.", fieldErrors };

  const [dupe] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (dupe) return { error: "That email already has an account.", fieldErrors: { email: "Already in use." } };

  const tempPassword = crypto.randomBytes(9).toString("base64url");
  await db.insert(users).values({
    name,
    email,
    passwordHash: await hashPassword(tempPassword),
    role,
  });
  revalidatePath("/settings");
  return { ok: true, tempPassword };
}

export async function setStaffActive(id: number, active: boolean): Promise<FormState> {
  const admin = await requireAdminUser();
  if (!admin) return { error: "Not authorized." };
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return { error: "User not found." };
  if (target.role === "owner") return { error: "The owner account cannot be deactivated." };
  if (target.id === admin.id) return { error: "You cannot deactivate your own account." };
  await db.update(users).set({ active }).where(eq(users.id, id));
  if (!active) await db.execute(sql`delete from sessions where user_id = ${id}`);
  revalidatePath("/settings");
  return { ok: true };
}

export async function resetStaffPassword(
  id: number,
): Promise<FormState & { tempPassword?: string }> {
  const admin = await requireAdminUser();
  if (!admin) return { error: "Not authorized." };
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target || target.role === "demo") return { error: "User not found." };
  const tempPassword = crypto.randomBytes(9).toString("base64url");
  await db.update(users).set({ passwordHash: await hashPassword(tempPassword) }).where(eq(users.id, id));
  await db.execute(sql`delete from sessions where user_id = ${id}`);
  return { ok: true, tempPassword };
}

import "server-only";
import crypto from "node:crypto";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { passwordResetTokens, sessions, users } from "@/db/schema";

/* Passwords are hashed with Node's built-in scrypt — no plaintext, no deps. */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, SCRYPT.keylen, SCRYPT, (err, derived) =>
      err ? reject(err) : resolve(derived),
    ),
  );
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, n, r, p, salt, hex] = stored.split("$");
    if (algo !== "scrypt") return false;
    const expected = Buffer.from(hex, "hex");
    const actual = await new Promise<Buffer>((resolve, reject) =>
      crypto.scrypt(
        password,
        salt,
        expected.length,
        { N: Number(n), r: Number(r), p: Number(p) },
        (err, derived) => (err ? reject(err) : resolve(derived)),
      ),
    );
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ---------------- Sessions (opaque token, httpOnly cookie, 30d) ---------------- */
export const SESSION_COOKIE = "dp_session";
const SESSION_DAYS = 30;
const REFRESH_AFTER_DAYS = 15;

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const secure = () => process.env.NODE_ENV === "production";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: "owner" | "admin" | "staff" | "demo";
};

export const DEFAULT_DEMO_USER: AuthUser = {
  id: 0,
  email: "demo@dugsipay.local",
  name: "Demo School",
  role: "demo",
};

export async function createSession(userId: number): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ tokenHash: sha256(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secure(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/**
 * Returns the currently authenticated user.
 * If no real session is active, returns DEFAULT_DEMO_USER (role: "demo").
 * This allows instant, barrier-free access to the demo dashboard without login.
 */
export async function getAuthUser(): Promise<AuthUser> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return DEFAULT_DEMO_USER;

    const rows = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        active: users.active,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
      .limit(1);

    const row = rows[0];
    if (!row || !row.active) return DEFAULT_DEMO_USER;

    // Sliding expiry: extend when less than half the lifetime remains.
    const remaining = row.expiresAt.getTime() - Date.now();
    if (remaining < REFRESH_AFTER_DAYS * 86_400_000) {
      try {
        const newExpiry = new Date(Date.now() + SESSION_DAYS * 86_400_000);
        await db
          .update(sessions)
          .set({ expiresAt: newExpiry })
          .where(eq(sessions.tokenHash, sha256(token)));
        jar.set(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: secure(),
          path: "/",
          expires: newExpiry,
        });
      } catch {}
    }

    return {
      id: row.userId,
      email: row.email,
      name: row.name,
      role: row.role as AuthUser["role"],
    };
  } catch {
    return DEFAULT_DEMO_USER;
  }
}

/** Returns the authenticated user only if it is a real account (non-demo). */
export async function getRealAuthUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (user.role === "demo") return null;
  return user;
}

/* ---------------- Role helpers ---------------- */
export const ADMIN_ROLES = new Set(["owner", "admin"]);
export const WRITE_ROLES = new Set(["owner", "admin", "staff"]);

export function canWrite(user: AuthUser | null): boolean {
  return !!user && WRITE_ROLES.has(user.role);
}
export function canAdmin(user: AuthUser | null): boolean {
  return !!user && ADMIN_ROLES.has(user.role);
}

type GuardResult = { error: string } | null;

/** Pure login logic (no cookies) — shared by the server action and tests. */
export async function loginWithPassword(
  emailRaw: string,
  password: string,
): Promise<{ ok: true; userId: number } | { ok?: false; error: string }> {
  const email = emailRaw.trim().toLowerCase().slice(0, 160);
  if (!email || !password) return { error: "Incorrect email or password." };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.active) {
    await new Promise((r) => setTimeout(r, 350));
    return { error: "Incorrect email or password." };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Too many failed attempts — try again in 15 minutes." };
  }
  const valid = await verifyPassword(password, user.passwordHash).catch(() => false);
  if (!valid) {
    const attempts = user.failedAttempts + 1;
    await db
      .update(users)
      .set({
        failedAttempts: attempts,
        lockedUntil: attempts >= 8 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      })
      .where(eq(users.id, user.id));
    await new Promise((r) => setTimeout(r, 350));
    return { error: "Incorrect email or password." };
  }
  await db.update(users).set({ failedAttempts: 0, lockedUntil: null }).where(eq(users.id, user.id));
  return { ok: true, userId: user.id };
}

/** Server-action guard: any signed-in or demo user (read paths). */
export async function guardUser(): Promise<AuthUser | GuardResult> {
  return getAuthUser();
}

/** Server-action guard: writes allowed for real owner/admin/staff — blocked for demo. */
export async function guardWriteAction(): Promise<GuardResult> {
  const user = await getAuthUser();
  if (!canWrite(user)) {
    return {
      error:
        "Demo mode is read-only — please sign in or create your school workspace to make changes.",
    };
  }
  return null;
}

/** Server-action guard: sensitive operations (settings, deletions, staff, demo data). */
export async function guardAdminAction(): Promise<GuardResult> {
  const user = await getAuthUser();
  if (user.role === "demo") {
    return {
      error: "Demo mode is read-only — sign in as school owner/admin to change settings.",
    };
  }
  if (!canAdmin(user)) {
    return { error: "Only the owner/admin can do that." };
  }
  return null;
}

/** Removes expired sessions + used/expired reset tokens (called opportunistically). */
export async function cleanupAuthTables(now = new Date()): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
  await db
    .delete(passwordResetTokens)
    .where(or(lt(passwordResetTokens.expiresAt, now)));
}

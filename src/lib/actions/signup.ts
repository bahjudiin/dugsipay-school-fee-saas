"use server";

import { db } from "@/db";
import { signups } from "@/db/schema";
import { normalizeSomaliPhone } from "@/lib/phone";
import type { FormState } from "@/lib/actions/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const clamp = (s: string, n: number) => s.slice(0, n);

/** Public landing-page signup (free plan, single school per workspace). */
export async function submitSignup(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const honeypot = str(fd, "website");
  // Silently accept bot submissions without storing them.
  if (honeypot) return { ok: true };

  const schoolName = clamp(str(fd, "schoolName"), 120);
  const contactName = clamp(str(fd, "contactName"), 120);
  const rawPhone = str(fd, "phone");
  const email = clamp(str(fd, "email"), 160);
  const studentCount = str(fd, "studentCount");
  const plan = clamp(str(fd, "plan"), 20);
  if (!["monthly","annual","lifetime"].includes(plan)) return { error: "Invalid plan selected." };
  const message = clamp(str(fd, "message"), 500);

  const phone = normalizeSomaliPhone(rawPhone);
  const fieldErrors: Record<string, string> = {};
  if (!schoolName) fieldErrors.schoolName = "School name is required.";
  if (!contactName) fieldErrors.contactName = "Your name is required.";
  if (!phone) fieldErrors.phone = "Enter a valid Somali number, e.g. +252 61 234 5678.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = "Enter a valid email or leave it empty.";
  if (Object.keys(fieldErrors).length)
    return { error: "Please fix the highlighted fields.", fieldErrors };

  try {
    await db.insert(signups).values({
      schoolName,
      contactName,
      phone: phone!,
      email,
      studentCount,
      plan,
      message,
    });
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not submit right now — please try again or contact us on WhatsApp." };
  }
}

"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { classes, payments, schoolSettings, students } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import type { FormState } from "@/lib/actions/types";
import { guardAdminAction, guardUser, guardWriteAction } from "@/lib/auth";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function updateSettings(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const blocked = await guardAdminAction();
  if (blocked) return blocked;
  const schoolName = str(fd, "schoolName");
  const phone = str(fd, "phone");
  const email = str(fd, "email");
  const address = str(fd, "address");
  const currency = str(fd, "currency") || "USD";
  const customCurrency = str(fd, "customCurrency").toUpperCase().slice(0, 6);
  const language = str(fd, "language") === "so" ? "so" : "en";
  const rollPrefix = (str(fd, "rollPrefix") || "DS").replace(/[^A-Za-z0-9-]/g, "").slice(0, 10) || "DS";
  const receiptPrefix = (str(fd, "receiptPrefix") || "RCP").replace(/[^A-Za-z0-9-]/g, "").slice(0, 10) || "RCP";
  const receiptFooter = str(fd, "receiptFooter");
  const logoDataRaw = str(fd, "logoData");
  const removeLogo = fd.get("removeLogo") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!schoolName) fieldErrors.schoolName = "School name is required.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = "Enter a valid email address.";
  if (currency === "CUSTOM" && !/^[A-Z]{3,6}$/.test(customCurrency))
    fieldErrors.customCurrency = "Enter a 3-letter currency code, e.g. AED.";
  if (logoDataRaw && !logoDataRaw.startsWith("data:image/"))
    fieldErrors.logoData = "Logo must be an image file (PNG, JPG, SVG…).";
  if (logoDataRaw && logoDataRaw.length > 400_000)
    fieldErrors.logoData = "Logo image is too large (max ~300 KB).";
  if (Object.keys(fieldErrors).length)
    return { error: "Please fix the highlighted fields.", fieldErrors };

  const finalCurrency = currency === "CUSTOM" ? customCurrency : currency;

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(schoolSettings)
        .values({ id: 1 })
        .onConflictDoNothing({ target: schoolSettings.id });
      const [current] = await tx
        .select()
        .from(schoolSettings)
        .where(eq(schoolSettings.id, 1))
        .limit(1);

      await tx
        .update(schoolSettings)
        .set({
          schoolName,
          phone,
          email,
          address,
          currency: finalCurrency,
          language,
          rollPrefix,
          receiptPrefix,
          receiptFooter,
          ...(removeLogo
            ? { logoData: null }
            : logoDataRaw
              ? { logoData: logoDataRaw }
              : {}),
          updatedAt: new Date(),
        })
        .where(eq(schoolSettings.id, 1));

      const changes: string[] = [];
      if (current) {
        if (current.schoolName !== schoolName) changes.push(`name → "${schoolName}"`);
        if (current.currency !== finalCurrency) changes.push(`currency → ${finalCurrency}`);
        if (current.language !== language) changes.push(`language → ${language}`);
        if (current.phone !== phone) changes.push("phone updated");
        if (current.email !== email) changes.push("email updated");
        if (current.address !== address) changes.push("address updated");
        if (current.receiptFooter !== receiptFooter) changes.push("receipt footer updated");
        if (removeLogo || logoDataRaw) changes.push("logo updated");
      }
      await logActivity(
        "settings.updated",
        `School settings updated${changes.length ? ": " + changes.join(", ") : "."}`,
        { changes },
        tx,
      );
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not save settings. Please try again." };
  }
}

export async function addClass(_prev: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const monthlyFee = Number(str(fd, "monthlyFee") || "0");
  if (!name) return { error: "Class name is required.", fieldErrors: { name: "Required." } };
  if (!Number.isFinite(monthlyFee) || monthlyFee < 0)
    return { error: "Invalid fee.", fieldErrors: { monthlyFee: "Enter 0 or more." } };
  try {
    const [maxSort] = await db
      .select({ max: sql<number>`coalesce(max(${classes.sortOrder}), 0)` })
      .from(classes);
    await db.transaction(async (tx) => {
      await tx
        .insert(classes)
        .values({ name, monthlyFee: monthlyFee.toFixed(2), sortOrder: (maxSort?.max ?? 0) + 1 });
      await logActivity("class.added", `Class added: ${name} (fee ${monthlyFee})`, { name, monthlyFee }, tx);
    });
    revalidatePath("/settings");
    revalidatePath("/students");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: `Could not add class "${name}" — it may already exist.` };
  }
}

export async function updateClass(
  id: number,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const name = str(fd, "name");
  const monthlyFee = Number(str(fd, "monthlyFee") || "0");
  if (!name) return { error: "Class name is required." };
  if (!Number.isFinite(monthlyFee) || monthlyFee < 0) return { error: "Invalid fee." };
  try {
    const [old] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
    if (!old) return { error: "Class not found." };
    await db.transaction(async (tx) => {
      await tx
        .update(classes)
        .set({ name, monthlyFee: monthlyFee.toFixed(2) })
        .where(eq(classes.id, id));
      if (old.name !== name || Number(old.monthlyFee) !== monthlyFee) {
        await logActivity(
          "class.updated",
          `Class updated: ${old.name} → ${name} (fee ${old.monthlyFee} → ${monthlyFee})`,
          { id },
          tx,
        );
      }
    });
    revalidatePath("/settings");
    revalidatePath("/students");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: `Could not update class — the name may already be taken.` };
  }
}

/** Safe delete: classes with enrolled students cannot be deleted. */
export async function deleteClass(id: number): Promise<FormState> {
  try {
    const [c] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
    if (!c) return { error: "Class not found." };
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(students)
      .where(eq(students.classId, id));
    if (count > 0) {
      return {
        error: `"${c.name}" still has ${count} student${count === 1 ? "" : "s"}. Move them to another class first.`,
      };
    }
    await db.transaction(async (tx) => {
      await tx.delete(classes).where(eq(classes.id, id));
      await logActivity("class.deleted", `Class deleted: ${c.name}`, { id, name: c.name }, tx);
    });
    revalidatePath("/settings");
    revalidatePath("/students");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not delete the class." };
  }
}

/**
 * Load realistic sample data for demos/tryouts.
 * Every generated student is flagged isDemo = true, so the cleanup tool
 * can remove them (and their payments) with one click. Never touches
 * existing real records, and refuses to run twice.
 */
export async function generateDemoData(): Promise<FormState & { loaded?: number }> {
  const blocked = await guardAdminAction();
  if (blocked) return { ...blocked, loaded: 0 };
  const NAMES: [string, string][] = [
    ["Amina", "Yusuf"], ["Mohamed", "Ali"], ["Layla", "Hassan"], ["Abdi", "Farah"],
    ["Hodan", "Warsame"], ["Yusuf", "Omar"], ["Fadumo", "Ahmed"], ["Ahmed", "Nur"],
    ["Khadija", "Ismail"], ["Ibrahim", "Sheikh"], ["Deqa", "Mahad"], ["Omar", "Abdullahi"],
    ["Naima", "Said"], ["Hassan", "Osman"], ["Sahra", "Abdulle"], ["Abdullahi", "Muse"],
    ["Hibo", "Jama"], ["Mustafa", "Aden"], ["Halima", "Roble"], ["Ali", "Hirsi"],
    ["Zainab", "Gaal"], ["Bashir", "Duale"], ["Qaali", "Barre"], ["Sumaya", "Dirie"],
  ];
  const ARCHIVED: [string, string][] = [["Hamda", "Egal"], ["Farhan", "Mohamud"]];
  const PARENTS = [
    "Fadumo", "Hodan", "Khadija", "Deqa", "Naima", "Sahra", "Hibo", "Halima",
    "Zainab", "Qaali", "Sumaya", "Maryan", "Ifrah", "Ubah", "Rahma", "Safia",
    "Asha", "Barwaaqo", "Farhiya", "Sagal", "Deeqa", "Nimo", "Amina", "Layla",
  ];
  const CLASSES: [string, number][] = [
    ["Grade 1", 20], ["Grade 2", 22], ["Grade 3", 24],
    ["Grade 4", 26], ["Grade 5", 28], ["Grade 6", 30],
  ];
  const METHODS = ["EVC Plus", "Zaad", "Cash", "EVC Plus", "eDahab", "Cash"];
  const OPS = ["61", "71", "72", "68", "77"];

  const phone = (i: number) =>
    "252" + OPS[i % OPS.length] + String(1000000 + ((i * 7919) % 8999999));

  try {
    const loaded = await db.transaction(async (tx) => {
      // Refuse to double-load.
      const [demoCount] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.isDemo, true));
      if (demoCount.count > 0) return 0;

      // Ensure demo classes exist (keep existing ones as-is).
      const classMap = new Map<string, { id: number; fee: number }>();
      for (let ci = 0; ci < CLASSES.length; ci++) {
        const [name, fee] = CLASSES[ci];
        const [existing] = await tx
          .select()
          .from(classes)
          .where(eq(classes.name, name))
          .limit(1);
        if (existing) {
          classMap.set(name, { id: existing.id, fee: Number(existing.monthlyFee) });
        } else {
          const [inserted] = await tx
            .insert(classes)
            .values({ name, monthlyFee: fee.toFixed(2), sortOrder: ci + 1 })
            .returning({ id: classes.id });
          classMap.set(name, { id: inserted.id, fee });
        }
      }

      // Reserve roll + receipt sequences.
      const [seqs] = await tx
        .select({
          nextRollSeq: schoolSettings.nextRollSeq,
          nextReceiptSeq: schoolSettings.nextReceiptSeq,
          rollPrefix: schoolSettings.rollPrefix,
          receiptPrefix: schoolSettings.receiptPrefix,
        })
        .from(schoolSettings)
        .where(eq(schoolSettings.id, 1));
      let rollSeq = seqs?.nextRollSeq ?? 1;
      let receiptSeq = seqs?.nextReceiptSeq ?? 1;
      const rollPrefix = (seqs?.rollPrefix || "DS").trim() || "DS";
      const receiptPrefix = (seqs?.receiptPrefix || "RCP").trim() || "RCP";

      let paymentCount = 0;
      const insertPaymentsFor = async (
        studentId: number,
        studentName: string,
        className: string,
        fee: number,
        i: number,
        now: Date,
        enrolled: Date,
      ) => {
        const startYm = enrolled.getFullYear() * 12 + enrolled.getMonth();
        const endYm = now.getFullYear() * 12 + now.getMonth();
        for (let ym = startYm; ym <= endYm; ym++) {
          const mi = ym % 12;
          if (i % 7 === 0 && mi === 8) continue; // skipped September → has debt
          if (i % 9 === 0 && mi === now.getMonth()) continue; // no current-month payment
          const amount = i % 5 === 0 && mi === now.getMonth() ? fee / 2 : fee;
          const day = 4 + ((i + mi) % 8);
          const createdAt = new Date(Math.floor(ym / 12), mi, day, 10 + (i % 6), 15);
          await tx.insert(payments).values({
            receiptNo: `${receiptPrefix}-${String(receiptSeq++).padStart(5, "0")}`,
            studentId,
            studentName,
            className,
            amount: amount.toFixed(2),
            method: METHODS[(i + paymentCount) % METHODS.length],
            forMonth: `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`,
            note: "",
            receivedBy: "Office Admin",
            createdAt,
          });
          paymentCount++;
        }
      };

      const now = new Date();
      for (let i = 0; i < NAMES.length; i++) {
        const [firstName, lastName] = NAMES[i];
        const [className, fee] = CLASSES[i % CLASSES.length];
        const cls = classMap.get(className)!;
        const enrolledAt = new Date(now.getFullYear(), 6 + (i % 3) - 1, 2 + ((i * 5) % 24), 9); // Jun–Aug
        const name = `${firstName} ${lastName}`;
        const [s] = await tx
          .insert(students)
          .values({
            rollNo: `${rollPrefix}-${String(rollSeq++).padStart(4, "0")}`,
            firstName,
            lastName,
            classId: cls.id,
            gender: i % 2 === 0 ? "Female" : "Male",
            parentName: `${PARENTS[i % PARENTS.length]} ${lastName}`,
            parentPhone: phone(i),
            status: "active",
            enrolledAt,
            isDemo: true,
          })
          .returning({ id: students.id });
        await insertPaymentsFor(s.id, name, className, cls.fee, i, now, enrolledAt);
      }

      // Two archived alumni with an old payment trail.
      for (let i = 0; i < ARCHIVED.length; i++) {
        const [firstName, lastName] = ARCHIVED[i];
        const cls = classMap.get("Grade 1")!;
        const name = `${firstName} ${lastName}`;
        const enrolledAt = new Date(now.getFullYear(), 0, 10 + i, 9);
        const [s] = await tx
          .insert(students)
          .values({
            rollNo: `${rollPrefix}-${String(rollSeq++).padStart(4, "0")}`,
            firstName,
            lastName,
            classId: cls.id,
            gender: i % 2 === 0 ? "Female" : "Male",
            parentName: `${PARENTS[(i + 9) % PARENTS.length]} ${lastName}`,
            parentPhone: phone(i + 40),
            status: "archived",
            enrolledAt,
            isDemo: true,
          })
          .returning({ id: students.id });
        for (let m = 1; m <= 3; m++) {
          await tx.insert(payments).values({
            receiptNo: `${receiptPrefix}-${String(receiptSeq++).padStart(5, "0")}`,
            studentId: s.id,
            studentName: name,
            className: "Grade 1",
            amount: cls.fee.toFixed(2),
            method: METHODS[(i + m) % METHODS.length],
            forMonth: `${now.getFullYear()}-${String(m).padStart(2, "0")}`,
            note: "",
            receivedBy: "Office Admin",
            createdAt: new Date(now.getFullYear(), m - 1, 6, 11),
          });
          paymentCount++;
        }
      }

      await tx
        .update(schoolSettings)
        .set({ nextRollSeq: rollSeq, nextReceiptSeq: receiptSeq })
        .where(eq(schoolSettings.id, 1));

      await logActivity(
        "data.generated",
        `Sample data loaded: ${NAMES.length + ARCHIVED.length} demo students, ${paymentCount} demo payments. All are flagged as demo and can be removed with one click from Settings.`,
        { students: NAMES.length + ARCHIVED.length, payments: paymentCount },
        tx,
      );
      return NAMES.length + ARCHIVED.length;
    });

    revalidatePath("/dashboard", "layout");
    if (loaded === 0) {
      return { error: "Sample data is already loaded. Use “Clean demo data” if you want to remove it." };
    }
    return { ok: true, loaded };
  } catch (err) {
    console.error(err);
    return { error: "Could not load sample data." };
  }
}

/**
 * Safe demo-data cleanup.
 * ONLY records explicitly flagged isDemo = true are removed.
 * Real students and payments are never touched.
 */
export async function purgeDemoData(): Promise<FormState & { removed?: number }> {
  const blocked = await guardAdminAction();
  if (blocked) return { ...blocked, removed: 0 };
  try {
    const demoStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.isDemo, true));
    if (!demoStudents.length) return { ok: true, removed: 0 };
    const ids = demoStudents.map((d) => d.id);
    const removed = await db.transaction(async (tx) => {
      await tx.delete(payments).where(inArray(payments.studentId, ids));
      await tx.delete(students).where(inArray(students.id, ids));
      await logActivity(
        "data.purged",
        `Removed ${ids.length} demo student record${ids.length === 1 ? "" : "s"} (flagged as demo). No real records were touched.`,
        { count: ids.length },
        tx,
      );
      return ids.length;
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, removed };
  } catch (err) {
    console.error(err);
    return { error: "Cleanup failed." };
  }
}



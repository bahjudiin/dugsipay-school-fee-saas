import "server-only";

import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "@/db";
import { activityLog, classes, payments, schoolSettings, students } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { getAuthUser } from "@/lib/auth";

type DbOrTx = NodePgDatabase<Record<string, never>>;

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

/**
 * Writes the whole sample dataset inside an open transaction.
 * Shared by Settings → "Load sample data" and the automatic demo bootstrap.
 * Every student is flagged isDemo = true, so the cleanup tool can remove
 * them (and their payments) with one click. Never touches existing records
 * and returns 0 when demo rows are already loaded.
 */
export async function seedDemoDataTx(tx: DbOrTx): Promise<number> {
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
}

/**
 * Live-demo bootstrap: anonymous visitors (role "demo") must land on a school
 * that actually has students, classes and payments — not an empty shell.
 * Seeds once when the workspace has no students at all; never re-seeds after
 * an owner cleaned the demo data, and never runs for signed-in accounts.
 * Cached per request so layout + pages share one execution.
 */
export const ensureDemoSampleData = cache(async (): Promise<number> => {
  try {
    const user = await getAuthUser();
    if (user.role !== "demo") return 0;

    const [state] = await db.select({ total: sql<number>`count(*)::int` }).from(students);
    if (state.total > 0) return 0;

    // Respect an owner's explicit "Clean demo data" — do not bring it back.
    const [purged] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(eq(activityLog.type, "data.purged"));
    if (purged.n > 0) return 0;

    return await db.transaction(async (tx) => {
      // Serialize concurrent visitors so only one of them seeds.
      await tx.execute(sql`select pg_advisory_xact_lock(8724113)`);
      const [again] = await tx.select({ total: sql<number>`count(*)::int` }).from(students);
      if (again.total > 0) return 0;
      return seedDemoDataTx(tx);
    });
  } catch (err) {
    // The demo must still render (even if sparse) when bootstrapping fails.
    console.error("Demo bootstrap skipped:", err);
    return 0;
  }
});

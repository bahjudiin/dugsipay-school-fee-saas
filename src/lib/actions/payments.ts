"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { classes, payments, schoolSettings, students } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import type { FormState } from "@/lib/actions/types";
import { guardAdminAction, guardUser, guardWriteAction } from "@/lib/auth";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function recordPayment(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const blocked = await guardWriteAction();
  if (blocked) return blocked;
  const studentId = Number(str(fd, "studentId"));
  const amount = Number(str(fd, "amount"));
  const method = str(fd, "method") || "Cash";
  const forMonth = str(fd, "forMonth");
  const note = str(fd, "note");
  const receivedBy = str(fd, "receivedBy");

  const fieldErrors: Record<string, string> = {};
  if (!Number.isInteger(studentId) || studentId <= 0)
    fieldErrors.studentId = "Choose a student (use the search box).";
  if (!Number.isFinite(amount) || amount <= 0)
    fieldErrors.amount = "Enter an amount greater than zero.";
  if (forMonth && !/^\d{4}-\d{2}$/.test(forMonth))
    fieldErrors.forMonth = "Invalid month.";
  if (Object.keys(fieldErrors).length)
    return { error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const [s] = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        rollNo: students.rollNo,
        className: classes.name,
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, studentId))
      .limit(1);
    if (!s) return { error: "Student not found." };

    const created = await db.transaction(async (tx) => {
      const [seqRow] = await tx
        .update(schoolSettings)
        .set({ nextReceiptSeq: sql`${schoolSettings.nextReceiptSeq} + 1` })
        .where(eq(schoolSettings.id, 1))
        .returning({ prefix: schoolSettings.receiptPrefix, seq: schoolSettings.nextReceiptSeq });
      const receiptNo = `${(seqRow?.prefix || "RCP").trim() || "RCP"}-${String((seqRow?.seq ?? 2) - 1).padStart(5, "0")}`;

      const studentName = `${s.firstName} ${s.lastName}`.trim();
      const [row] = await tx
        .insert(payments)
        .values({
          receiptNo,
          studentId,
          studentName, // snapshot – preserved even if the student is renamed
          className: s.className ?? "",
          amount: amount.toFixed(2),
          method,
          forMonth,
          note,
          receivedBy,
        })
        .returning({ id: payments.id });
      await logActivity(
        "payment.recorded",
        `Payment ${receiptNo}: ${amount.toFixed(2)} from ${studentName} (${s.rollNo}) via ${method}`,
        { paymentId: row.id, studentId, receiptNo, amount },
        tx,
      );
      return row;
    });

    revalidatePath("/payments");
    revalidatePath(`/students/${studentId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: created.id };
  } catch (err) {
    console.error(err);
    return { error: "Could not record the payment. Please try again." };
  }
}

export async function deletePayment(id: number): Promise<FormState> {
  const blocked = await guardAdminAction();
  if (blocked) return blocked;
  try {
    const [p] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!p) return { error: "Payment not found." };
    await db.transaction(async (tx) => {
      await tx.delete(payments).where(eq(payments.id, id));
      await logActivity(
        "payment.deleted",
        `Deleted payment ${p.receiptNo} (${p.amount}) recorded for ${p.studentName}.`,
        { paymentId: id, receiptNo: p.receiptNo },
        tx,
      );
    });
    revalidatePath("/payments");
    revalidatePath(`/students/${p.studentId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not delete the payment." };
  }
}

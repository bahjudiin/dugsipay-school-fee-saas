"use server";

import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { classes, payments, schoolSettings, students } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { normalizeSomaliPhone } from "@/lib/phone";
import type { FormState } from "@/lib/actions/types";
import { guardAdminAction, guardUser, guardWriteAction } from "@/lib/auth";

const str = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "").trim();

/** Consume the next roll number inside a transaction (race-safe). */
async function consumeRollNo(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) {
  const [row] = await tx
    .update(schoolSettings)
    .set({ nextRollSeq: sql`${schoolSettings.nextRollSeq} + 1` })
    .where(eq(schoolSettings.id, 1))
    .returning({
      prefix: schoolSettings.rollPrefix,
      seq: schoolSettings.nextRollSeq,
    });
  const seq = (row?.seq ?? 2) - 1;
  const prefix = (row?.prefix || "DS").trim() || "DS";
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

/** Peek at what the next auto roll number will be (does not consume it). */
export async function peekNextRollNo(): Promise<string> {
  const guard = await guardUser();
  if ("error" in Object(guard)) return "—";
  const [row] = await db
    .select({ prefix: schoolSettings.rollPrefix, seq: schoolSettings.nextRollSeq })
    .from(schoolSettings)
    .where(eq(schoolSettings.id, 1));
  const prefix = (row?.prefix || "DS").trim() || "DS";
  return `${prefix}-${String(row?.seq ?? 1).padStart(4, "0")}`;
}

function validateStudentInput(fd: FormData) {
  const fieldErrors: Record<string, string> = {};
  const firstName = str(fd, "firstName");
  const lastName = str(fd, "lastName");
  const classId = Number(str(fd, "classId"));
  const rollNo = str(fd, "rollNo");
  const parentName = str(fd, "parentName");
  const gender = str(fd, "gender");
  const notes = str(fd, "notes");
  const rawPhone = str(fd, "parentPhone");
  const parentPhone = normalizeSomaliPhone(rawPhone);

  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!Number.isInteger(classId) || classId <= 0)
    fieldErrors.classId = "Please choose a class.";
  if (rawPhone && !parentPhone)
    fieldErrors.parentPhone =
      "Enter a valid Somali number, e.g. +252 61 234 5678 or 0612345678.";

  return {
    fieldErrors,
    values: {
      firstName,
      lastName,
      classId,
      rollNo,
      gender,
      parentName,
      parentPhone: parentPhone ?? rawPhone,
      notes,
    },
  };
}

export async function createStudent(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const blocked = await guardWriteAction();
  if (blocked) return blocked;
  const { fieldErrors, values } = validateStudentInput(fd);
  if (Object.keys(fieldErrors).length) return { error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const created = await db.transaction(async (tx) => {
      let rollNo = values.rollNo;
      if (rollNo) {
        const [dupe] = await tx
          .select({ id: students.id })
          .from(students)
          .where(eq(students.rollNo, rollNo))
          .limit(1);
        if (dupe) throw new Error("DUPLICATE_ROLL");
      } else {
        rollNo = await consumeRollNo(tx);
      }
      const [row] = await tx
        .insert(students)
        .values({ ...values, rollNo, status: "active" })
        .returning({ id: students.id });
      await logActivity(
        "student.created",
        `Student added: ${values.firstName} ${values.lastName} (${rollNo})`.replace(/\s+/g, " "),
        { studentId: row.id, rollNo },
        tx,
      );
      return row;
    });
    revalidatePath("/students");
    revalidatePath("/dashboard");
    return { ok: true, id: created.id };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_ROLL") {
      return {
        error: "That roll number is already taken.",
        fieldErrors: { rollNo: "Roll number already exists. Leave empty to auto-generate." },
      };
    }
    console.error(err);
    return { error: "Could not save the student. Please try again." };
  }
}

export async function updateStudent(
  id: number,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { fieldErrors, values } = validateStudentInput(fd);
  if (!values.rollNo) fieldErrors.rollNo = "Roll number is required for existing students.";
  if (Object.keys(fieldErrors).length) return { error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const [existing] = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (!existing) return { error: "Student not found." };

    const [dupe] = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.rollNo, values.rollNo), sql`${students.id} <> ${id}`))
      .limit(1);
    if (dupe) {
      return {
        error: "That roll number is already taken.",
        fieldErrors: { rollNo: "Another student already uses this roll number." },
      };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(students)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(students.id, id));
      // Payment history is preserved automatically: payments keep their own
      // name/class snapshots, so edits never rewrite financial records.
      const changes: string[] = [];
      if (existing.firstName !== values.firstName || existing.lastName !== values.lastName)
        changes.push(`name: ${existing.firstName} ${existing.lastName} → ${values.firstName} ${values.lastName}`);
      if (existing.classId !== values.classId) changes.push("class changed");
      if (existing.parentPhone !== values.parentPhone) changes.push("parent phone changed");
      if (existing.rollNo !== values.rollNo) changes.push(`roll: ${existing.rollNo} → ${values.rollNo}`);
      await logActivity(
        "student.updated",
        `Student updated: ${values.firstName} ${values.lastName} (${values.rollNo})${changes.length ? " — " + changes.join(", ") : ""}`.replace(/\s+/g, " "),
        { studentId: id, changes },
        tx,
      );
    });

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/payments");
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (err) {
    console.error(err);
    return { error: "Could not update the student. Please try again." };
  }
}

export async function setStudentStatus(
  id: number,
  status: "active" | "archived",
): Promise<FormState> {
  try {
    const [s] = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (!s) return { error: "Student not found." };
    await db.update(students).set({ status, updatedAt: new Date() }).where(eq(students.id, id));
    await logActivity(
      status === "archived" ? "student.archived" : "student.restored",
      `${status === "archived" ? "Archived" : "Restored"} student: ${s.firstName} ${s.lastName} (${s.rollNo})`.replace(/\s+/g, " "),
      { studentId: id },
    );
    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not update status." };
  }
}

/**
 * Safe delete: a student with payment records can NEVER be hard-deleted
 * (financial history must be preserved) — archive them instead.
 */
export async function deleteStudent(id: number): Promise<FormState> {
  const blocked = await guardAdminAction();
  if (blocked) return blocked;
  try {
    const [s] = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (!s) return { error: "Student not found." };
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments)
      .where(eq(payments.studentId, id));
    if (count > 0) {
      return {
        error: `This student has ${count} payment record${count === 1 ? "" : "s"}. To protect financial history, archive the student instead of deleting.`,
      };
    }
    await db.transaction(async (tx) => {
      await tx.delete(students).where(eq(students.id, id));
      await logActivity(
        "student.deleted",
        `Deleted student: ${s.firstName} ${s.lastName} (${s.rollNo}) — no payment records existed.`.replace(/\s+/g, " "),
        { studentId: id, rollNo: s.rollNo },
        tx,
      );
    });
    revalidatePath("/students");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not delete the student." };
  }
}

/** Lightweight autocomplete used by payment forms and quick search. */
export async function searchStudents(query: string): Promise<
  { id: number; name: string; rollNo: string; className: string; fee: number; status: string }[]
> {
  const guard = await guardUser();
  if ("error" in Object(guard)) return [];
  const q = query.trim();
  if (!q) return [];
  const rows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      rollNo: students.rollNo,
      status: students.status,
      className: classes.name,
      fee: classes.monthlyFee,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(
      and(
        eq(students.status, "active"),
        or(
          ilike(students.firstName, `%${q}%`),
          ilike(students.lastName, `%${q}%`),
          ilike(students.rollNo, `%${q}%`),
          ilike(sql`${students.firstName} || ' ' || ${students.lastName}`, `%${q}%`),
        ),
      ),
    )
    .orderBy(asc(students.firstName), asc(students.lastName))
    .limit(8);
  return rows.map((r) => ({
    id: r.id,
    name: `${r.firstName} ${r.lastName}`.trim(),
    rollNo: r.rollNo,
    className: r.className ?? "—",
    fee: Number(r.fee ?? 0),
    status: r.status,
  }));
}

/** All classes for dropdowns. */
export async function listClasses() {
  return db.select().from(classes).orderBy(asc(classes.sortOrder), asc(classes.name));
}



"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { classes, schoolSettings, students } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { normalizeSomaliPhone } from "@/lib/phone";
import { guardAdminAction, guardUser, guardWriteAction } from "@/lib/auth";

export type ImportRow = {
  rollNo: string;
  firstName: string;
  lastName: string;
  className: string;
  gender: string;
  parentName: string;
  parentPhone: string;
  notes: string;
};

export type RowValidation = {
  row: ImportRow;
  valid: boolean;
  errors: string[];
  warnings: string[];
  /** True when a provided roll number already exists in the database. */
  rollConflict: boolean;
  /** True when name + parent phone match an existing student. */
  possibleDuplicate: boolean;
  normalizedPhone: string | null;
};

export type ImportResult = {
  ok?: boolean;
  error?: string;
  imported: number;
  skipped: number;
  failed: number;
  failures: { name: string; reason: string }[];
};

/** Validate parsed CSV rows against the database (duplicates + conflicts). */
export async function validateImport(inputRows: ImportRow[]): Promise<RowValidation[]> {
  if (!("id" in Object(await guardUser()))) return [];
  const rows = inputRows.slice(0, 500);
  const classRows = await db.select().from(classes);
  const classByName = new Map(classRows.map((c) => [c.name.toLowerCase(), c]));

  const existing = await db
    .select({
      rollNo: students.rollNo,
      firstName: students.firstName,
      lastName: students.lastName,
      parentPhone: students.parentPhone,
    })
    .from(students);
  const rollSet = new Set(existing.map((s) => s.rollNo.toLowerCase()));
  const identitySet = new Set(
    existing.map(
      (s) =>
        `${s.firstName.toLowerCase()}|${s.lastName.toLowerCase()}|${s.parentPhone || ""}`,
    ),
  );

  const seenRolls = new Set<string>();
  let autoSeq = 0;

  return rows.map((raw) => {
    const row: ImportRow = {
      rollNo: raw.rollNo?.trim() ?? "",
      firstName: raw.firstName?.trim() ?? "",
      lastName: raw.lastName?.trim() ?? "",
      className: raw.className?.trim() ?? "",
      gender: raw.gender?.trim() ?? "",
      parentName: raw.parentName?.trim() ?? "",
      parentPhone: raw.parentPhone?.trim() ?? "",
      notes: raw.notes?.trim() ?? "",
    };
    const errors: string[] = [];
    const warnings: string[] = [];
    let rollConflict = false;
    let possibleDuplicate = false;

    if (!row.firstName) errors.push("First name is required");
    const classMatch = classByName.get(row.className.toLowerCase());
    if (!row.className) errors.push("Class is required");
    else if (!classMatch) errors.push(`Class "${row.className}" does not exist — create it on the Classes page first`);

    const normalizedPhone = normalizeSomaliPhone(row.parentPhone);
    if (row.parentPhone && !normalizedPhone)
      errors.push(`Invalid phone "${row.parentPhone}" (use +252… or 06…)`);

    if (row.rollNo) {
      if (rollSet.has(row.rollNo.toLowerCase())) {
        rollConflict = true;
        errors.push(`Roll number ${row.rollNo} already exists in the database`);
      }
      if (seenRolls.has(row.rollNo.toLowerCase())) {
        rollConflict = true;
        errors.push(`Roll number ${row.rollNo} appears twice in this file`);
      }
      seenRolls.add(row.rollNo.toLowerCase());
    } else {
      autoSeq++;
    }

    if (!rollConflict) {
      const identity = `${row.firstName.toLowerCase()}|${row.lastName.toLowerCase()}|${
        normalizedPhone ?? row.parentPhone
      }`;
      if (row.firstName && identitySet.has(identity)) {
        possibleDuplicate = true;
        warnings.push("A student with the same name and parent phone already exists");
      }
    }

    return {
      row,
      valid: errors.length === 0,
      errors,
      warnings,
      rollConflict,
      possibleDuplicate,
      normalizedPhone,
    };
  });
}

/**
 * Commit validated rows. `selected` flags which rows to import
 * (duplicates/invalid rows should be deselected by the user).
 */
export async function commitImport(selected: RowValidation[]): Promise<ImportResult> {
  const blocked = await guardWriteAction();
  if (blocked) return { error: blocked.error, imported: 0, skipped: 0, failed: 0, failures: [] };
  const importable = selected.filter((v) => v.valid).slice(0, 500);
  if (!importable.length) {
    return { error: "No valid rows selected to import.", imported: 0, skipped: selected.length, failed: 0, failures: [] };
  }
  try {
    const classRows = await db.select().from(classes);
    const classByName = new Map(classRows.map((c) => [c.name.toLowerCase(), c]));

    const result = await db.transaction(async (tx) => {
      let imported = 0;
      const failures: { name: string; reason: string }[] = [];

      // Reserve a block of roll numbers for rows that need auto-generation.
      const autoCount = importable.filter((v) => !v.row.rollNo).length;
      let nextSeq = 0;
      let prefix = "DS";
      if (autoCount > 0) {
        const [seqRow] = await tx
          .update(schoolSettings)
          .set({ nextRollSeq: sql`${schoolSettings.nextRollSeq} + ${autoCount}` })
          .where(eq(schoolSettings.id, 1))
          .returning({ prefix: schoolSettings.rollPrefix, seq: schoolSettings.nextRollSeq });
        nextSeq = (seqRow?.seq ?? autoCount + 1) - autoCount;
        prefix = (seqRow?.prefix || "DS").trim() || "DS";
      }

      for (const v of importable) {
        try {
          const cls = classByName.get(v.row.className.toLowerCase());
          if (!cls) throw new Error("class not found");
          const rollNo = v.row.rollNo || `${prefix}-${String(nextSeq++).padStart(4, "0")}`;
          await tx.insert(students).values({
            rollNo,
            firstName: v.row.firstName,
            lastName: v.row.lastName,
            classId: cls.id,
            gender: v.row.gender,
            parentName: v.row.parentName,
            parentPhone: v.normalizedPhone ?? v.row.parentPhone,
            notes: v.row.notes,
            status: "active",
          });
          imported++;
        } catch (err) {
          failures.push({
            name: `${v.row.firstName} ${v.row.lastName}`.trim() || "(unnamed row)",
            reason: err instanceof Error && err.message.includes("unique") ? "roll number conflict" : "insert failed",
          });
        }
      }

      await logActivity(
        "import.completed",
        `CSV import finished: ${imported} imported, ${failures.length} failed, ${selected.length - importable.length} skipped.`,
        { imported, failed: failures.length, skipped: selected.length - importable.length },
        tx,
      );
      return { imported, failures };
    });

    revalidatePath("/students");
    revalidatePath("/dashboard");
    return {
      ok: true,
      imported: result.imported,
      skipped: selected.length - importable.length,
      failed: result.failures.length,
      failures: result.failures,
    };
  } catch (err) {
    console.error(err);
    return { error: "Import failed unexpectedly.", imported: 0, skipped: 0, failed: 0, failures: [] };
  }
}

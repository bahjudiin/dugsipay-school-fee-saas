import { db } from "@/db";
import { activityLog } from "@/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type ActivityType =
  | "student.created"
  | "student.updated"
  | "student.archived"
  | "student.restored"
  | "student.deleted"
  | "payment.recorded"
  | "payment.deleted"
  | "import.completed"
  | "settings.updated"
  | "class.added"
  | "class.updated"
  | "class.deleted"
  | "data.generated"
  | "data.purged";

type DbOrTx = NodePgDatabase<Record<string, never>>;

/** Append an activity entry. Accepts an optional transaction handle. */
export async function logActivity(
  type: ActivityType,
  message: string,
  meta?: Record<string, unknown>,
  tx?: DbOrTx,
): Promise<void> {
  try {
    const runner = (tx ?? db) as unknown as typeof db;
    await runner.insert(activityLog).values({ type, message, meta: meta ?? null });
  } catch (err) {
    // Activity logging must never break the main workflow.
    console.error("logActivity failed:", err);
  }
}

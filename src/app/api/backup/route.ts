import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, classes, payments, schoolSettings, students } from "@/db/schema";
import { canAdmin, getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Full JSON backup of all school data — owner/admin only. */
export async function GET() {
  const user = await getAuthUser();
  if (!canAdmin(user)) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const [settings, classRows, studentRows, paymentRows, activityRows] = await Promise.all([
      db.select().from(schoolSettings),
      db.select().from(classes).orderBy(asc(classes.sortOrder)),
      db.select().from(students).orderBy(asc(students.id)),
      db.select().from(payments).orderBy(asc(payments.id)),
      db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(5000),
    ]);

    const payload = {
      app: "DuqsiPay",
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: {
        school_settings: settings,
        classes: classRows,
        students: studentRows,
        payments: paymentRows,
        activity_log: activityRows,
      },
    };

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="duqsipay-backup-${stamp}.json"`,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Backup failed" }, { status: 500 });
  }
}

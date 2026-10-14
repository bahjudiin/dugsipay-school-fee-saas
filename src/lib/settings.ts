import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolSettings, type Settings } from "@/db/schema";

export function defaultSettings(): Settings {
  return {
    id: 1,
    schoolName: "DugsiPAY School",
    logoData: null,
    phone: "",
    email: "",
    address: "",
    currency: "USD",
    language: "en",
    rollPrefix: "DS",
    nextRollSeq: 1,
    receiptPrefix: "RCP",
    nextReceiptSeq: 1,
    receiptFooter: "",
    updatedAt: new Date(),
  };
}

/** Load the singleton settings row, creating defaults on first use. */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    await db
      .insert(schoolSettings)
      .values({ id: 1 })
      .onConflictDoNothing({ target: schoolSettings.id });
    const rows = await db
      .select()
      .from(schoolSettings)
      .where(eq(schoolSettings.id, 1))
      .limit(1);
    return rows[0] ?? defaultSettings();
  } catch {
    return defaultSettings();
  }
});

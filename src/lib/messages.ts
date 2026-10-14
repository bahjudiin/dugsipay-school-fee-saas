/** Bilingual WhatsApp/SMS message templates (master copy — warm, not aggressive). */

export function reminderMessage(
  lang: string,
  o: {
    parentName: string;
    schoolName: string;
    studentName: string;
    rollNo: string;
    className: string;
    balance: string;
  },
): string {
  if (lang === "so") {
    return [
      `Salaam ${o.parentName || "Waalid/Mas'uul"},`,
      ``,
      `Waan ka xasuusinayaa lacagta fasalka ee ${o.studentName} (${o.rollNo}) — ${o.className}.`,
      `Haraagaagu waa ${o.balance}. Haddii aad bixisay, fadlan iska dhig rasiidhkan.`,
      ``,
      `Waxaad bixin kartaa EVC Plus, Zaad, Cash ama Bank.`,
      `Mahadsanid! — ${o.schoolName}`,
    ].join("\n");
  }
  return [
    `Salaam ${o.parentName || "Parent/Guardian"},`,
    ``,
    `This is a friendly fee reminder from ${o.schoolName}.`,
    `Student: ${o.studentName} (${o.rollNo}) — ${o.className}`,
    `Outstanding balance: ${o.balance}`,
    `If you've already paid, please share the receipt.`,
    ``,
    `We accept EVC Plus, Zaad, Cash or bank transfer. Mahadsanid!`,
  ].join("\n");
}

export function receiptMessage(
  lang: string,
  o: {
    schoolName: string;
    receiptNo: string;
    studentName: string;
    rollNo?: string;
    amount: string;
    month: string;
    method: string;
    date: string;
  },
): string {
  if (lang === "so") {
    return [
      `${o.schoolName} — Rasiidh ${o.receiptNo}`,
      ``,
      `Lacag laga helay: ${o.studentName}${o.rollNo ? ` (${o.rollNo})` : ""}`,
      `Lacagta: ${o.amount}`,
      `Bisha: ${o.month} · Habka: ${o.method}`,
      `Taariikhda: ${o.date}`,
      ``,
      `Mahadsanid! Waxtaar u muhiim ah waxbarashada ilmahaaga.`,
    ].join("\n");
  }
  return [
    `${o.schoolName} — Fee Receipt ${o.receiptNo}`,
    ``,
    `Received from: ${o.studentName}${o.rollNo ? ` (${o.rollNo})` : ""}`,
    `Amount: ${o.amount}`,
    `For: ${o.month} · Method: ${o.method}`,
    `Date: ${o.date}`,
    ``,
    `Thank you — your child's education matters.`,
  ].join("\n");
}

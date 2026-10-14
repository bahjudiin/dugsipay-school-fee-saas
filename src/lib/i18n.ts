/** Tiny dictionary for the UI language setting (English / Somali). */
export type Lang = "en" | "so";

const dict: Record<string, { en: string; so: string }> = {
  "nav.dashboard": { en: "Dashboard", so: "Bogga Hore" },
  "nav.students": { en: "Students", so: "Ardayda" },
  "nav.classes": { en: "Classes", so: "Fasallada" },
  "nav.payments": { en: "Payments", so: "Lacagaha" },
  "nav.reports": { en: "Reports", so: "Warbixinada" },
  "nav.import": { en: "Import CSV", so: "Soo dejin CSV" },
  "nav.activity": { en: "Activity", so: "Dhaqdhaqaaqa" },
  "nav.settings": { en: "Settings", so: "Dejinta" },
  "app.tagline": { en: "School fee management", so: "Maareynta lacagaha iskuulka" },
  "common.search": { en: "Search", so: "Raadi" },
  "common.save": { en: "Save", so: "Kaydso" },
  "common.cancel": { en: "Cancel", so: "Jooji" },
  "common.edit": { en: "Edit", so: "Wax ka beddel" },
  "common.delete": { en: "Delete", so: "Tirtir" },
  "common.archive": { en: "Archive", so: "Dhig kaydka" },
  "common.restore": { en: "Restore", so: "So celi" },
  "common.addStudent": { en: "Add student", so: "Kudar arday" },
  "common.recordPayment": { en: "Record payment", so: "Diiwaan geli lacag" },
  "common.active": { en: "Active", so: "Firfircoon" },
  "common.archived": { en: "Archived", so: "Kaydsan" },
  "common.name": { en: "Name", so: "Magaca" },
  "common.class": { en: "Class", so: "Fasalka" },
  "common.amount": { en: "Amount", so: "Lacagta" },
  "common.status": { en: "Status", so: "Xaaladda" },
  "common.receipt": { en: "Receipt", so: "Rasiidh" },
  "common.parent": { en: "Parent / Guardian", so: "Waalidka / Mas'uulka" },
  "dash.collectedMonth": { en: "Collected this month", so: "Lacagta bishan la ururiyay" },
  "dash.outstanding": { en: "Outstanding fees", so: "Lacagaha dhiman" },
  "dash.activeStudents": { en: "Active students", so: "Ardayda firfircoon" },
  "dash.recentPayments": { en: "Recent payments", so: "Lacagihii dambeeyay" },
  "greet.morning": { en: "Good morning, {n}", so: "Subax wanaagsan, {n}" },
  "greet.afternoon": { en: "Good afternoon, {n}", so: "Galab wanaagsan, {n}" },
  "greet.evening": { en: "Good evening, {n}", so: "Fiid wanaagsan, {n}" },
  "dash.studentsPaid": { en: "Students paid", so: "Ardayda bixisay" },
  "dash.thisMonth": { en: "this month", so: "bishan" },
  "dash.overdue": { en: "Overdue students", so: "Arday seegtay" },
  "dash.notPaidYet": { en: "haven't paid yet", so: "weli ma bixin" },
  "dash.totalStudents": { en: "Total students", so: "Wadarta ardayda" },
  "dash.classesCount": { en: "{n} classes", so: "{n} fasal" },
  "common.viewAll": { en: "View all", so: "Dhammaan eeg" },
};

export function t(lang: string | undefined, key: string): string {
  const l: Lang = lang === "so" ? "so" : "en";
  const entry = dict[key];
  if (!entry) return key;
  return entry[l] ?? entry.en;
}

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "so", label: "Soomaali (Somali)" },
] as const;

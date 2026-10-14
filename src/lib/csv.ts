/** Minimal, dependency-free CSV parsing (handles quoted fields, commas, newlines). */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ""); // strip BOM

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cur.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      cur.push(field);
      field = "";
      if (cur.some((c) => c.trim() !== "")) rows.push(cur);
      cur = [];
    } else {
      field += ch;
    }
  }
  cur.push(field);
  if (cur.some((c) => c.trim() !== "")) rows.push(cur);
  return rows;
}

export const IMPORT_HEADERS = [
  "roll_no",
  "first_name",
  "last_name",
  "class_name",
  "gender",
  "parent_name",
  "parent_phone",
  "notes",
] as const;

export function templateCsv(): string {
  const example = [
    "",
    "Amina",
    "Yusuf",
    "Grade 1",
    "Female",
    "Hodan Yusuf",
    "+252 61 555 0102",
    "example row — delete before importing",
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [
    IMPORT_HEADERS.join(","),
    example.map(esc).join(","),
  ].join("\r\n");
}

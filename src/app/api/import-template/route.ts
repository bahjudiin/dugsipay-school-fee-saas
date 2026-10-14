import { templateCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(templateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="duqsipay-students-template.csv"`,
    },
  });
}

import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { classes } from "@/db/schema";
import StudentForm from "@/components/StudentForm";
import { Card, PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const settings = await getSettings();
  const classRows = await db
    .select()
    .from(classes)
    .orderBy(asc(classes.sortOrder), asc(classes.name));

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link
        href="/students"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back to students
      </Link>
      <PageHeader
        title="Add a student"
        subtitle="Roll numbers can be typed manually or generated automatically on save."
      />
      <Card className="p-6">
        <StudentForm
          classes={classRows}
          phoneHint="Any Somali format works — it will be saved as +252XXXXXXXXX for WhatsApp."
        />
      </Card>
    </div>
  );
}

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";
import ImportWizard from "@/components/ImportWizard";
import { Alert, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const classRows = await db.select().from(classes).orderBy(asc(classes.sortOrder), asc(classes.name));

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <PageHeader
        title="Import students from CSV"
        subtitle="Bulk registration with a template, live validation, duplicate detection and a full import summary."
      />
      {classRows.length === 0 && (
        <div className="mb-4">
          <Alert tone="warn">
            Create at least one class on the Classes page before importing — every row must reference an existing class name.
          </Alert>
        </div>
      )}
      <ImportWizard classNames={classRows.map((c) => c.name)} />
    </div>
  );
}

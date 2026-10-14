"use client";

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { deleteStudent, setStudentStatus } from "@/lib/actions/students";
import ConfirmAction from "@/components/ConfirmAction";
import { btnGhost } from "@/components/ui";

export default function StudentRowActions({
  id,
  name,
  archived,
}: {
  id: number;
  name: string;
  archived: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {archived ? (
        <ConfirmAction
          title={`Restore ${name}?`}
          body="The student will become active again and appear in fee lists."
          confirmLabel="Restore"
          successMessage="Student restored"
          action={async () => setStudentStatus(id, "active")}
          trigger={
            <button type="button" className={btnGhost} title="Restore">
              <ArchiveRestore className="size-4" />
            </button>
          }
        />
      ) : (
        <ConfirmAction
          title={`Archive ${name}?`}
          body="Archived students are hidden from active lists. Their payment history is fully preserved and they can be restored anytime."
          confirmLabel="Archive"
          successMessage="Student archived — history preserved"
          action={async () => setStudentStatus(id, "archived")}
          trigger={
            <button type="button" className={btnGhost} title="Archive">
              <Archive className="size-4" />
            </button>
          }
        />
      )}
      <ConfirmAction
        danger
        title={`Delete ${name}?`}
        body="This permanently removes the student record. Students with payment history cannot be deleted — they must be archived instead, so financial records stay intact."
        confirmLabel="Delete permanently"
        action={async () => deleteStudent(id)}
        trigger={
          <button
            type="button"
            className={`${btnGhost} text-danger-500 hover:bg-danger-50 hover:text-danger-600`}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        }
      />
    </div>
  );
}

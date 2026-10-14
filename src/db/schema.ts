import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Single-row settings table (id is always 1). */
export const schoolSettings = pgTable("school_settings", {
  id: integer("id").primaryKey().default(1),
  schoolName: text("school_name").notNull().default("DugsiPAY School"),
  logoData: text("logo_data"),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  currency: text("currency").notNull().default("USD"),
  language: text("language").notNull().default("en"),
  rollPrefix: text("roll_prefix").notNull().default("DS"),
  nextRollSeq: integer("next_roll_seq").notNull().default(1),
  receiptPrefix: text("receipt_prefix").notNull().default("RCP"),
  nextReceiptSeq: integer("next_receipt_seq").notNull().default(1),
  receiptFooter: text("receipt_footer").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  monthlyFee: numeric("monthly_fee", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    rollNo: text("roll_no").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull().default(""),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id),
    gender: text("gender").notNull().default(""),
    parentName: text("parent_name").notNull().default(""),
    parentPhone: text("parent_phone").notNull().default(""),
    status: text("status").notNull().default("active"), // active | archived
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notes: text("notes").notNull().default(""),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("students_roll_no_unique").on(t.rollNo),
    index("students_class_status_idx").on(t.classId, t.status),
    index("students_status_idx").on(t.status),
    index("students_name_idx").on(t.firstName, t.lastName),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    receiptNo: text("receipt_no").notNull(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
    // Snapshots – payment history stays correct even if the student is edited.
    studentName: text("student_name").notNull().default(""),
    className: text("class_name").notNull().default(""),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    method: text("method").notNull().default("Cash"),
    forMonth: text("for_month").notNull().default(""), // YYYY-MM
    note: text("note").notNull().default(""),
    receivedBy: text("received_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_receipt_no_unique").on(t.receiptNo),
    index("payments_student_created_idx").on(t.studentId, t.createdAt),
    index("payments_created_idx").on(t.createdAt),
  ],
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(), // e.g. student.created, payment.recorded
    message: text("message").notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("activity_created_idx").on(t.createdAt)],
);

/** Workspace users (owner/admin/staff/demo) — email+scrypt auth, cookie sessions. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("staff"), // owner | admin | staff | demo
  active: boolean("active").notNull().default(true),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId), index("sessions_expires_idx").on(t.expiresAt)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Free-plan signup leads captured on the public landing page. */
export const signups = pgTable("signups", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  studentCount: text("student_count").notNull().default(""),
  plan: text("plan").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Settings = typeof schoolSettings.$inferSelect;
export type ClassRow = typeof classes.$inferSelect;
export type StudentRow = typeof students.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type ActivityRow = typeof activityLog.$inferSelect;
export type SignupRow = typeof signups.$inferSelect;

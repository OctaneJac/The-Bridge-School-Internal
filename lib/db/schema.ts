import { 
  pgTable, 
  varchar, 
  uuid, 
  timestamp, 
  serial, 
  integer, 
  date,
  unique,
  pgEnum
} from "drizzle-orm/pg-core";

// =========================
// ENUMS
// =========================
export const studentStatusEnum = pgEnum('student_status', ['active', 'inactive', 'graduated', 'transferred']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent']);

// =========================
// USERS
// =========================
export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().$type<"teacher" | "admin" | "super_admin">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  branch_id: integer("branch_id").references(() => branches.id),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// =========================
// BRANCHES
// =========================
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

// =========================
// STUDENTS
// =========================
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  dob: date("dob"),
  gender: varchar("gender", { length: 50 }),
  branch_id: integer("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

// =========================
// SESSIONS
// =========================
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g. 2025–2026
  branch_id: integer("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  start_date: date("start_date"),
  end_date: date("end_date"),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// =========================
// CLASSES
// =========================
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g. Grade 8
  branch_id: integer("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  session_id: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  class_teacher_id: uuid("class_teacher_id").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

// =========================
// STUDENT CLASSES (Junction Table)
// =========================
export const studentClasses = pgTable("student_classes", {
  id: serial("id").primaryKey(),
  student_id: integer("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  class_id: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  status: studentStatusEnum("status").notNull().default("active"),
}, (table) => ({
  unq: unique().on(table.student_id, table.class_id),
}));

export type StudentClass = typeof studentClasses.$inferSelect;
export type NewStudentClass = typeof studentClasses.$inferInsert;

// =========================
// COURSES
// =========================
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  branch_id: integer("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  session_id: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

// =========================
// TEACHER COURSES (Junction Table)
// =========================
export const teacherCourses = pgTable("teacher_courses", {
  id: serial("id").primaryKey(),
  teacher_id: uuid("teacher_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  course_id: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
}, (table) => ({
  unq: unique().on(table.teacher_id, table.course_id),
}));

export type TeacherCourse = typeof teacherCourses.$inferSelect;
export type NewTeacherCourse = typeof teacherCourses.$inferInsert;

// =========================
// CLASS COURSES (Junction Table)
// =========================
export const classCourses = pgTable("class_courses", {
  id: serial("id").primaryKey(),
  class_id: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  course_id: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
}, (table) => ({
  unq: unique().on(table.class_id, table.course_id),
}));

export type ClassCourse = typeof classCourses.$inferSelect;
export type NewClassCourse = typeof classCourses.$inferInsert;

// =========================
// EXAMS
// =========================
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  course_id: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  session_id: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  max_marks: integer("max_marks").notNull(),
  exam_date: date("exam_date"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

// =========================
// GRADES
// =========================
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }).notNull(),
  student_id: integer("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  marks_obtained: integer("marks_obtained").notNull(),
}, (table) => ({
  unq: unique().on(table.exam_id, table.student_id),
}));

export type Grade = typeof grades.$inferSelect;
export type NewGrade = typeof grades.$inferInsert;

// =========================
// ATTENDANCE
// =========================
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  class_id: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  student_id: integer("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  teacher_id: uuid("teacher_id").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  unq: unique().on(table.student_id, table.class_id, table.date),
}));

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

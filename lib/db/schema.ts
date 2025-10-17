import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().$type<"teacher" | "admin" | "super_admin">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

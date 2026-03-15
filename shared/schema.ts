import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We keep the variable name 'checks' so storage.ts can find it
// We also name the database table 'checks' for consistency
export const checks = pgTable("checks", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  analysis: text("analysis").notNull(), // Stores Score, Feedback, and Optimized Resume
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// These must use the 'checks' variable defined above
export const insertCheckSchema = createInsertSchema(checks);
export type InsertCheck = z.infer<typeof insertCheckSchema>;
export type Check = typeof checks.$inferSelect;
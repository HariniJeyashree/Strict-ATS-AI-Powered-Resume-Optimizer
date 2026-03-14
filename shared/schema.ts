import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  analysis: text("analysis").notNull(), // Stores Score, Feedback, and Optimized Resume
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes);
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
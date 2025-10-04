import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  postedDate: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number(),
  description: z.string(),
});

export type Job = z.infer<typeof jobSchema>;

export const searchJobsSchema = z.object({
  city: z.string().min(1, "City is required"),
  radius: z.number().min(1).max(100),
});

export type SearchJobs = z.infer<typeof searchJobsSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

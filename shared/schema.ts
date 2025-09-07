import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  referrerId: varchar("referrer_id").references(() => users.id),
  maxReferrals: integer("max_referrals").notNull().default(5),
  totalEarnings: integer("total_earnings").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredName: text("referred_name").notNull(),
  referredPhone: text("referred_phone").notNull(),
  status: text("status").notNull().default("pending"), // pending, verified, completed
  earnings: integer("earnings").notNull().default(50),
  assignedAt: timestamp("assigned_at").notNull().default(sql`now()`),
  verifiedAt: timestamp("verified_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  referrerId: true,
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referredName: true,
  referredPhone: true,
});

export const loginSchema = z.object({
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  otp: z.string().length(6, "รหัส OTP ต้องมี 6 หลัก"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

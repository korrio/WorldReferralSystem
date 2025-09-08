import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// สมาชิกที่มี World ID แล้ว และพร้อมรับผู้ติดตาม
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  worldIdReferralLink: text("world_id_referral_link").notNull().unique(), // referral link ของ World ID
  currentAssignments: integer("current_assignments").notNull().default(0), // จำนวนคนที่ได้รับไปแล้ว
  maxAssignments: integer("max_assignments").notNull().default(10), // จำนวนสูงสุดที่รับได้
  isActive: boolean("is_active").notNull().default(true), // สถานะว่าพร้อมรับผู้ติดตามใหม่หรือไม่
  totalEarned: integer("total_earned").notNull().default(0), // รายได้ที่ได้รับจาก World ID (บาท)
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// ประวัติการจัดสรร referral
export const referralAssignments = pgTable("referral_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().references(() => members.id),
  ipAddress: text("ip_address"), // IP ของผู้สมัครใหม่ (เพื่อป้องกัน duplicate)
  userAgent: text("user_agent"), // User agent ของผู้สมัครใหม่
  referralUsed: text("referral_used").notNull(), // referral link ที่ใช้
  status: text("status").notNull().default("pending"), // pending, completed, failed
  assignedAt: timestamp("assigned_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// Schema สำหรับ API
export const insertMemberSchema = createInsertSchema(members).pick({
  name: true,
  worldIdReferralLink: true,
  maxAssignments: true,
});

export const insertReferralAssignmentSchema = createInsertSchema(referralAssignments).pick({
  ipAddress: true,
  userAgent: true,
});

// Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type ReferralAssignment = typeof referralAssignments.$inferSelect;
export type InsertReferralAssignment = z.infer<typeof insertReferralAssignmentSchema>;
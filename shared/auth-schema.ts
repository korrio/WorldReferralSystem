import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";

// NextAuth required tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }), // Keep original NextAuth format
  image: text("image"),
  photoURL: text("photo_url"), // Firebase/Google photo URL
  
  // World ID fields
  worldIdNullifierHash: text("world_id_nullifier_hash").unique(), // World ID integration
  worldIdVerified: boolean("world_id_verified").default(false),
  verificationLevel: text("verification_level"), // orb, device
  worldIdReferralCode: text("world_id_referral_code"), // User's World ID referral code
  
  // Google/Firebase fields  
  googleUid: text("google_uid").unique(), // Firebase/Google UID
  provider: text("provider").default("worldid"), // 'worldid' or 'google'
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const accounts = pgTable("accounts", {
  userId: varchar("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: varchar("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Referral clicks tracking table
export const referralClicks = pgTable("referral_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerUserId: varchar("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // User whose referral code was used
  ipAddress: text("ip_address"), // IP address of the clicker
  userAgent: text("user_agent"), // Browser info
  clickedAt: timestamp("clicked_at").notNull().default(sql`now()`),
  convertedAt: timestamp("converted_at"), // When/if they signed up
  convertedUserId: varchar("converted_user_id").references(() => users.id, { onDelete: "set null" }), // The user who signed up
});

// Types for NextAuth
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ReferralClick = typeof referralClicks.$inferSelect;
export type InsertReferralClick = typeof referralClicks.$inferInsert;
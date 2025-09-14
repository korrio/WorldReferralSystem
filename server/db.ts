import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables first
config({ path: resolve(process.cwd(), '.env') });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import * as authSchema from "@shared/auth-schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Database connection:", DATABASE_URL ? "✅ Found" : "❌ Missing");
console.log("Database URL:", DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Hide password in logs

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema: { ...schema, ...authSchema } });

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});
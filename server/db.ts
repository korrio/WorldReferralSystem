import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables first
config({ path: resolve(process.cwd(), '.env') });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as authSchema from "@shared/auth-schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Database connection:", DATABASE_URL ? "✅ Found" : "❌ Missing");

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema: { ...schema, ...authSchema } });
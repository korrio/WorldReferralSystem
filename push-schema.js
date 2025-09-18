import { config } from "dotenv";
import { resolve } from "path";

// Set NODE_ENV to production by default if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as authSchema from "./shared/auth-schema.js";
import * as schema from "./shared/schema.js";

async function pushSchema() {
  console.log('🚀 Pushing database schema to production...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('📍 Target database:', databaseUrl.replace(/\/\/[^@]+@/, '//***:***@'));
  console.log('🌍 Environment:', process.env.NODE_ENV);
  
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    const db = drizzle(client, { 
      schema: { ...authSchema, ...schema },
      logger: true 
    });
    
    console.log('✅ Connected successfully');
    console.log('📋 Database schema will be created automatically on first query');
    
    // Test the connection by running a simple query
    console.log('🧪 Testing database connection...');
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database info:', {
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
    
    console.log('\n✅ Database is ready for use!');
    console.log('💡 Tables will be created automatically when the application starts');
    console.log('🔄 You can now deploy your application');
    
  } catch (error) {
    console.error('❌ Schema push failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

pushSchema();
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

import { Client } from "pg";

async function migrateAuthTables() {
  console.log('🚀 Creating authentication tables only...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('📍 Database URL:', databaseUrl.replace(/\/\/[^@]+@/, '//***:***@'));
  
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create users table (most important for authentication)
    console.log('👤 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE,
        "emailVerified" TIMESTAMP,
        image TEXT,
        photo_url TEXT,
        world_id_nullifier_hash TEXT UNIQUE,
        world_id_verified BOOLEAN DEFAULT false,
        verification_level TEXT,
        world_id_referral_code TEXT,
        google_uid TEXT UNIQUE,
        provider TEXT DEFAULT 'worldid',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    console.log('✅ Users table created/verified');
    
    // Create accounts table (NextAuth)
    console.log('🔐 Creating accounts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        "userId" VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, "providerAccountId")
      );
    `);
    console.log('✅ Accounts table created/verified');
    
    // Create sessions table (NextAuth)
    console.log('🎫 Creating sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        "sessionToken" TEXT PRIMARY KEY,
        "userId" VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Sessions table created/verified');
    
    // Create verification tokens table (NextAuth)
    console.log('🔍 Creating verification tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "verificationTokens" (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);
    console.log('✅ Verification tokens table created/verified');
    
    // Create referral clicks table
    console.log('📊 Creating referral clicks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS referral_clicks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_address TEXT,
        user_agent TEXT,
        clicked_at TIMESTAMP NOT NULL DEFAULT now(),
        converted_at TIMESTAMP,
        converted_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Referral clicks table created/verified');
    
    // Create essential indexes
    console.log('🚀 Creating essential indexes...');
    const indexes = [
      { name: 'idx_users_email', sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);' },
      { name: 'idx_users_google_uid', sql: 'CREATE INDEX IF NOT EXISTS idx_users_google_uid ON users(google_uid);' },
      { name: 'idx_users_world_id_hash', sql: 'CREATE INDEX IF NOT EXISTS idx_users_world_id_hash ON users(world_id_nullifier_hash);' },
      { name: 'idx_referral_clicks_referrer', sql: 'CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_user_id);' }
    ];
    
    for (const index of indexes) {
      try {
        await client.query(index.sql);
        console.log(`✅ Index ${index.name} created`);
      } catch (error) {
        console.log(`⚠️  Index ${index.name} failed: ${error.message}`);
      }
    }
    
    // Verify tables exist
    console.log('\n📋 Verifying created tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'accounts', 'sessions', 'verificationTokens', 'referral_clicks')
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Test user table specifically
    console.log('\n🧪 Testing users table...');
    const userTest = await client.query('SELECT COUNT(*) FROM users;');
    console.log(`📊 Users table: ${userTest.rows[0].count} records`);
    
    console.log('\n🎉 Authentication tables created successfully!');
    console.log('✅ Google authentication should now work');
    console.log('💡 You can now test the login on your production site');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

migrateAuthTables();
-- Production Database Schema Creation
-- Run this SQL script on your production database to create all required tables

-- Create users table
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

-- Create accounts table (NextAuth)
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

-- Create sessions table (NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
    "sessionToken" TEXT PRIMARY KEY,
    "userId" VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Create verification tokens table (NextAuth)
CREATE TABLE IF NOT EXISTS "verificationTokens" (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create referral clicks table
CREATE TABLE IF NOT EXISTS referral_clicks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMP NOT NULL DEFAULT now(),
    converted_at TIMESTAMP,
    converted_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL
);

-- Create members table (existing referral system)
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id VARCHAR(8) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    world_id_referral_code TEXT NOT NULL,
    referral_link TEXT NOT NULL,
    assignment_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT now(),
    status TEXT DEFAULT 'active'
);

-- Create referral assignments table
CREATE TABLE IF NOT EXISTS referral_assignments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    visitor_ip TEXT,
    user_agent TEXT,
    assigned_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_uid ON users(google_uid);
CREATE INDEX IF NOT EXISTS idx_users_world_id_hash ON users(world_id_nullifier_hash);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer ON referral_clicks(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_members_short_id ON members(short_id);

-- Display table creation confirmation
SELECT 'Database schema created successfully!' as status;
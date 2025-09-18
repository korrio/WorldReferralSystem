# Production Database Setup

## Problem
The production error shows: `relation "users" does not exist` - this means the production database doesn't have the required tables.

## Solution
You need to create the database schema on your production database. Here are three ways to do it:

### Option 1: Run SQL Script Directly (Recommended)
1. Connect to your production database using any PostgreSQL client (pgAdmin, DBeaver, or command line)
2. Run the SQL script: `create-production-tables.sql`
3. This will create all required tables and indexes

### Option 2: Use the Migration Script
1. Set your production DATABASE_URL in the environment
2. Run: `npm run db:migrate`

### Option 3: Use Drizzle Push (if you have drizzle-kit configured)
1. Run: `npm run db:push` with production DATABASE_URL

## Required Tables
The application needs these tables:
- `users` - User accounts (Google + World ID)
- `accounts` - NextAuth OAuth accounts
- `sessions` - NextAuth sessions  
- `verificationTokens` - NextAuth verification tokens
- `referral_clicks` - Referral click tracking
- `members` - Referral system members
- `referral_assignments` - Referral assignments

## After Setup
Once the tables are created, the Google authentication should work properly and you won't see the "relation users does not exist" error anymore.

## Verification
You can verify the setup by checking if these tables exist in your production database:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all the tables listed above.
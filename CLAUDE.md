# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build both client (Vite) and server (esbuild) for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to PostgreSQL

## Architecture Overview

This is a full-stack TypeScript application for a World ID referral system that automatically distributes referrals among members in a round-robin fashion.

### Stack
- **Frontend**: React 18 + Vite, Tailwind CSS + shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter (client-side routing)
- **State Management**: TanStack Query for server state

### Project Structure
```
client/          # React frontend
  src/
    components/  # shadcn/ui components
    pages/       # Route components (welcome, register, profile, not-found)
    lib/         # API client and utilities
server/          # Express backend
  index.ts       # Server entry point with logging middleware
  routes.ts      # API endpoints
  storage.ts     # Database operations
  db.ts          # Database connection
shared/          # Shared TypeScript schemas and types
  schema.ts      # Drizzle database schema and Zod validation
```

### Database Schema
**Referral System:**
- `members` - Members with World ID referral links and assignment tracking
- `referralAssignments` - Assignment history with IP tracking for duplicate prevention

**Authentication (NextAuth):**
- `users` - User accounts with World ID integration
- `accounts` - OAuth provider account links
- `sessions` - Active user sessions
- `verificationTokens` - Email verification tokens

### Key Features
- **Referral Distribution**: `/api/assign-referral` endpoint assigns referrals in round-robin fashion
- **Click Tracking**: `/r/:shortId` redirect endpoint tracks referral link clicks
- **Statistics**: Member stats, assignment history, and system-wide analytics
- **IP Tracking**: Prevents duplicate assignments from same IP
- **Dual World ID Auth**: IDKit direct integration + NextAuth OIDC flow
- **Session Management**: Database-backed sessions with World ID user data

### Path Aliases
- `@/` - Points to `client/src/`
- `@shared` - Points to `shared/` directory
- `@assets` - Points to `attached_assets/` directory

### Authentication Setup
**Environment Variables Required:**
- `WORLD_ID_APP_ID` - World ID application identifier
- `WORLD_ID_CLIENT_SECRET` - World ID client secret
- `VITE_WORLD_ID_APP_ID` - Client-side World ID app ID
- `NEXTAUTH_SECRET` - NextAuth JWT signing secret
- `NEXTAUTH_URL` - Application base URL

**Two Authentication Methods:**
1. **IDKit Direct** (`/lib/worldid.ts`) - Custom World ID widget integration
2. **NextAuth** (`/hooks/use-session.ts`) - Standard OAuth OIDC flow via `/api/auth/*`

### Development Notes
- Uses Replit-specific plugins in development mode
- Server runs on port 8000 (configurable via PORT env var)
- Database URL required in DATABASE_URL environment variable
- Supports both development (tsx) and production (node) execution
- NextAuth routes available at `/api/auth/*`
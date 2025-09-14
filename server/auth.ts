import { ExpressAuth } from "@auth/express";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "@shared/auth-schema";

// World ID Provider following the official template pattern
const WorldIDProvider = {
  id: "worldid",
  name: "World ID",
  type: "oidc" as const,
  issuer: "https://id.worldcoin.org",
  clientId: process.env.WORLD_ID_APP_ID!,
  clientSecret: process.env.WORLD_ID_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid",
    },
  },
  checks: ["pkce", "state"] as const,
  client: {
    id_token_signed_response_alg: "RS256",
  },
  profile(profile: any) {
    return {
      id: profile.sub,
      name: profile.name || profile.given_name || profile.family_name || "World ID User",
      email: profile.email || null,
      image: profile.picture || null,
      // Store World ID specific data
      worldIdNullifierHash: profile.sub, // sub is the nullifier hash
      worldIdVerified: true,
      verificationLevel: profile.verification_level || "device",
    };
  },
};

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [WorldIDProvider],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("NextAuth SignIn:", { user, account, profile });
      return true;
    },
    async session({ session, user }: any) {
      // Add World ID data to session
      if (user.worldIdNullifierHash) {
        session.user.worldIdNullifierHash = user.worldIdNullifierHash;
        session.user.worldIdVerified = user.worldIdVerified;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.worldIdNullifierHash = user.worldIdNullifierHash;
        token.worldIdVerified = user.worldIdVerified;
      }
      return token;
    },
  },
  pages: {
    signIn: '/register', // Use your existing registration page
    error: '/register', // Redirect errors to registration page
  },
  session: {
    strategy: "database" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

const authHandler = ExpressAuth(authConfig);
export { authHandler };
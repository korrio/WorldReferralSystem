import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  worldIdNullifierHash?: string;
  worldIdVerified?: boolean;
  verificationLevel?: string;
}

export interface Session {
  user: User;
  expires: string;
}

interface SessionData {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

export function useSession(): SessionData {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setStatus("loading");
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData && sessionData.user) {
          setSession(sessionData);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      setSession(null);
      setStatus("unauthenticated");
    }
  };

  return { data: session, status };
}

export async function signIn(providerId: string = "worldid") {
  // For now, redirect directly to World ID
  const worldIdUrl = `https://id.worldcoin.org/authorize?client_id=${import.meta.env.VITE_WORLD_ID_APP_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(window.location.origin + '/profile')}&state=nextauth`;
  window.location.href = worldIdUrl;
}

export async function signOut() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}
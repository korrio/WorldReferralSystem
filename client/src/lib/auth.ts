// Client-side NextAuth utilities
export interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    worldIdNullifierHash?: string;
    worldIdVerified?: boolean;
  };
  expires: string;
}

// Fetch session from NextAuth
export async function getSession(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return null;
    const session = await response.json();
    return session || null;
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return null;
  }
}

// Sign out
export async function signOut() {
  try {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Failed to sign out:', error);
  }
}

// Sign in with World ID (using NextAuth)
export function signInWithWorldID() {
  window.location.href = '/api/auth/signin/worldid';
}

// CSRF token for forms
export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/csrf');
    const data = await response.json();
    return data.csrfToken || null;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
}
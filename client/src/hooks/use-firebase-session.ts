import { useState, useEffect } from 'react';
import { onAuthStateChange, signOutUser, getIdToken, type FirebaseUser } from '@/lib/firebase';

interface UseFirebaseSessionReturn {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export function useFirebaseSession(): UseFirebaseSessionReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      
      // Store user session in localStorage for persistence
      if (firebaseUser) {
        localStorage.setItem('firebase_user', JSON.stringify(firebaseUser));
      } else {
        localStorage.removeItem('firebase_user');
      }
    });

    // Check for existing session in localStorage on initial load
    const storedUser = localStorage.getItem('firebase_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('firebase_user');
      }
    }

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      localStorage.removeItem('firebase_user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      return await getIdToken();
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshToken
  };
}
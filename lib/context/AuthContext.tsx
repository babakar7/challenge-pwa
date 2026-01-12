import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import {
  signInWithEmail,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  AuthError,
} from '@/lib/supabase/auth';
import { dataSync } from '@/lib/supabase/sync';
import { logger } from '@/lib/utils/logger';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    logger.log('AuthContext: Getting initial session...');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      logger.log('AuthContext: Initial session:', session ? 'exists' : 'null');
      setSession(session);
      setUser(session?.user ?? null);

      // Load user data if session exists
      if (session?.user) {
        logger.log('AuthContext: Loading user data for restored session...');
        await dataSync.loadUserData(session.user.id);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('AuthContext: Auth state changed:', event, session ? 'has session' : 'no session');
      setSession(session);
      setUser(session?.user ?? null);

      // Load user data on sign in, clear on sign out
      if (event === 'SIGNED_IN' && session?.user) {
        logger.log('AuthContext: Loading user data after sign in...');
        await dataSync.loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        logger.log('AuthContext: Clearing user data after sign out...');
        dataSync.clearUserData();
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmail(email, password);
  };

  const signOut = async () => {
    return authSignOut();
  };

  const resetPassword = async (email: string) => {
    return authResetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return authUpdatePassword(newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
  isDataLoading: boolean; // True while user data is being loaded after auth
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
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    // Get initial session and restore auth state
    logger.log('AuthContext: Getting initial session...');

    const initializeAuth = async () => {
      try {
        // First check if there's a cached session
        const { data: { session: cachedSession } } = await supabase.auth.getSession();
        logger.log('AuthContext: Cached session:', cachedSession ? 'exists' : 'null');

        if (cachedSession?.user) {
          // Refresh the session to ensure valid auth headers for RLS
          // This is critical - without it, queries fail silently after page refresh
          logger.log('AuthContext: Refreshing session to ensure valid auth headers...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            logger.error('AuthContext: Session refresh failed:', refreshError);
            setSession(null);
            setUser(null);
            setIsLoading(false);
            return;
          }

          const session = refreshData?.session;
          if (session?.user) {
            logger.log('AuthContext: Session refreshed successfully');
            setSession(session);
            setUser(session.user);

            // Load user data
            logger.log('AuthContext: Loading user data for restored session...');
            setIsDataLoading(true);
            try {
              await dataSync.loadUserData(session.user.id);
              logger.log('AuthContext: User data loaded successfully');
            } catch (loadError) {
              logger.error('AuthContext: Error loading user data:', loadError);
            } finally {
              setIsDataLoading(false);
            }
          } else {
            logger.log('AuthContext: No session after refresh');
            setSession(null);
            setUser(null);
          }
        } else {
          logger.log('AuthContext: No cached session found');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        logger.error('AuthContext: Error initializing auth:', error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('AuthContext: Auth state changed:', event, session ? 'has session' : 'no session');

      // Skip INITIAL_SESSION - we handle that in initializeAuth above
      // This prevents a race condition where isLoading is set to false before data loads
      if (event === 'INITIAL_SESSION') {
        logger.log('AuthContext: Skipping INITIAL_SESSION (handled by initializeAuth)');
        return;
      }

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
        isDataLoading,
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

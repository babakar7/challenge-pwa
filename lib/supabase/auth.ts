import { supabase } from './client';
import { logger } from '@/lib/utils/logger';

export type AuthError = {
  message: string;
  status?: number;
};

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  logger.log('signInWithEmail: Attempting sign in...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  logger.log('signInWithEmail: Result -', error ? `Error: ${error.message}` : 'Success', data?.session ? 'Has session' : 'No session');

  if (error) {
    return {
      error: {
        message: error.message,
        status: error.status,
      },
    };
  }

  return { error: null };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: {
        message: error.message,
        status: error.status,
      },
    };
  }

  return { error: null };
}

export async function resetPassword(
  email: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'revive-challenge://reset-password',
  });

  if (error) {
    return {
      error: {
        message: error.message,
        status: error.status,
      },
    };
  }

  return { error: null };
}

export async function updatePassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      error: {
        message: error.message,
        status: error.status,
      },
    };
  }

  return { error: null };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

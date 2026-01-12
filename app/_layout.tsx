import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { colors } from '@/lib/constants/theme';
import { AuthProvider } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useNotifications } from '@/lib/hooks/useNotifications';

// Wrapper component to use hooks that require AuthContext
function AppContent({ children }: { children: React.ReactNode }) {
  useNotifications();
  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    // Handle deep links for magic link authentication
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // Check if it's an auth callback
      if (url.includes('access_token') || url.includes('refresh_token')) {
        // Extract tokens from URL and set session
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    };

    // Add listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <AppContent>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="check-in"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Check in',
              headerStyle: { backgroundColor: colors.card },
              headerTintColor: colors.text,
            }}
          />
        </Stack>
      </AppContent>
    </AuthProvider>
  );
}

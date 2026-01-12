import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { dataSync } from '@/lib/supabase/sync';
import { colors } from '@/lib/constants/theme';

export default function Index() {
  const { session, user, isLoading } = useAuth();

  useEffect(() => {
    // Load user data when session is available
    if (session && user) {
      dataSync.loadUserData(user.id);
    } else if (!session) {
      dataSync.clearUserData();
    }
  }, [session, user]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

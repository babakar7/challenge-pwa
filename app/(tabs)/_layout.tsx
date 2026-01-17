import { Tabs, Redirect, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/lib/constants/theme';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppStore } from '@/lib/store/appStore';
import { NotEnrolledScreen } from '@/components/challenge/NotEnrolledScreen';
import { ChallengePendingScreen } from '@/components/challenge/ChallengePendingScreen';
import { useMealSelectionGating } from '@/lib/hooks/useMealSelectionGating';

export default function TabLayout() {
  const { session, isLoading } = useAuth();
  const challengeStatus = useAppStore(s => s.getChallengeStatus());
  const { shouldBlockDashboard, blockingReason, isChecking } = useMealSelectionGating();
  const pathname = usePathname();

  // Check if user is on the meals screen
  const isOnMealsScreen = pathname === '/meals' || pathname === '/(tabs)/meals';

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check challenge status
  if (challengeStatus === 'not_enrolled') {
    return <NotEnrolledScreen />;
  }

  // For pending status, check if meal selection is needed
  if (challengeStatus === 'pending') {
    // If still checking meal selection status, show pending screen
    if (isChecking) {
      return <ChallengePendingScreen />;
    }

    // If meal selection is required, redirect to meals tab
    if (shouldBlockDashboard && blockingReason === 'first_selection_required') {
      if (!isOnMealsScreen) {
        // Redirect to meals tab instead of showing blocking screen
        return <Redirect href="/(tabs)/meals" />;
      }
      // If already on meals screen, fall through to show tabs
    } else if (!shouldBlockDashboard) {
      // No blocking needed, show pending countdown
      return <ChallengePendingScreen />;
    }
  }

  // During active challenge, redirect to meals if blocking (unless already on meals)
  if (challengeStatus === 'active' && shouldBlockDashboard && !isChecking && !isOnMealsScreen) {
    return <Redirect href="/(tabs)/meals" />;
  }

  // Show tabs - user can access meals to complete selection
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progrès',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Repas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

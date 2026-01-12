import { ScrollView, View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  WeightInput,
  StepCounter,
  MealAdherence,
  CheckInButton,
  ExerciseToggle,
  DayNavigator,
} from '@/components/dashboard';
import { DeadlineWarning } from '@/components/meals';
import { useAppStore } from '@/lib/store/appStore';
import { useMealSelectionGating } from '@/lib/hooks/useMealSelectionGating';
import { colors, spacing, typography, borderRadius } from '@/lib/constants/theme';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const today = format(new Date(), 'EEEE, MMMM d');
  const cohort = useAppStore(s => s.cohort);
  const challengeStatus = useAppStore(s => s.getChallengeStatus());
  const challengeDay = useAppStore(s => s.getChallengeDay());
  const daysRemaining = useAppStore(s => s.getChallengeDaysRemaining());
  const selectedDate = useAppStore(s => s.selectedDate);
  const hasCheckedInForSelectedDate = useAppStore(s => s.hasCheckedInForSelectedDate());

  // Meal selection gating
  const { showDeadlineBanner, bannerUrgency, weekNeedingSelection, nextWeekInfo } = useMealSelectionGating();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const isEnded = challengeStatus === 'ended';

  // Format countdown for the deadline banner
  const getCountdownString = () => {
    if (!nextWeekInfo) return '';
    const { daysUntilDeadline, hoursUntilDeadline } = nextWeekInfo;
    if (daysUntilDeadline > 0) {
      return `${daysUntilDeadline}d ${hoursUntilDeadline % 24}h`;
    }
    return `${hoursUntilDeadline}h`;
  };

  // Navigate to meals tab
  const goToMeals = () => {
    router.push('/(tabs)/meals');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getGreeting()}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Meal Selection Deadline Banner */}
        {showDeadlineBanner && weekNeedingSelection && (
          <Pressable onPress={goToMeals} style={styles.bannerContainer}>
            <DeadlineWarning
              weekNumber={weekNeedingSelection}
              countdown={getCountdownString()}
              urgency={bannerUrgency}
            />
          </Pressable>
        )}

        {/* Day Navigator */}
        <DayNavigator />

        <CheckInButton disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />

        <Text style={styles.sectionTitle}>Daily Log</Text>

        <View style={styles.cards}>
          <WeightInput disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <StepCounter disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <MealAdherence disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <ExerciseToggle disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Log your progress to unlock check-in
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bannerContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  cards: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  challengeBadge: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  challengeBadgeEnded: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  challengeBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  challengeName: {
    ...typography.bodyMedium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  dayBadgeText: {
    ...typography.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },
  daysRemaining: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  challengeComplete: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  challengeCompleteSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

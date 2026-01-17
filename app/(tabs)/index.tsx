import { ScrollView, View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WeightInput,
  StepCounter,
  MealAdherence,
  CheckInButton,
  ExerciseToggle,
  DayNavigator,
  BreakfastPhoto,
} from '@/components/dashboard';
import { DeadlineWarning } from '@/components/meals';
import { WebContainer } from '@/components/ui/WebContainer';
import { ConfettiCelebration, ConfettiCelebrationRef } from '@/components/ui/ConfettiCelebration';
import { useAppStore } from '@/lib/store/appStore';
import { useMealSelectionGating } from '@/lib/hooks/useMealSelectionGating';
import { haptics } from '@/lib/services/hapticService';
import { colors, spacing, typography, borderRadius } from '@/lib/constants/theme';

const STREAK_MILESTONES = [7, 14, 21, 28];
const MILESTONE_STORAGE_KEY = 'lastCelebratedStreak';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const today = format(new Date(), 'EEEE d MMMM', { locale: fr });
  const confettiRef = useRef<ConfettiCelebrationRef>(null);

  const cohort = useAppStore(s => s.cohort);
  const streak = useAppStore(s => s.streak);
  const challengeStatus = useAppStore(s => s.getChallengeStatus());
  const challengeDay = useAppStore(s => s.getChallengeDay());
  const daysRemaining = useAppStore(s => s.getChallengeDaysRemaining());
  const selectedDate = useAppStore(s => s.selectedDate);
  const hasCheckedInForSelectedDate = useAppStore(s => s.hasCheckedInForSelectedDate());

  // Meal selection gating
  const { showDeadlineBanner, bannerUrgency, weekNeedingSelection, nextWeekInfo } = useMealSelectionGating();

  // Streak milestone celebration
  useEffect(() => {
    const checkStreakMilestone = async () => {
      const currentStreak = streak?.current_streak || 0;

      // Check if current streak is a milestone
      if (!STREAK_MILESTONES.includes(currentStreak)) return;

      // Check if we've already celebrated this milestone
      try {
        const lastCelebrated = await AsyncStorage.getItem(MILESTONE_STORAGE_KEY);
        const lastCelebratedStreak = lastCelebrated ? parseInt(lastCelebrated, 10) : 0;

        if (currentStreak > lastCelebratedStreak) {
          // New milestone! Celebrate!
          await AsyncStorage.setItem(MILESTONE_STORAGE_KEY, currentStreak.toString());
          await haptics.heavy();
          confettiRef.current?.bigCelebrate();
        }
      } catch (error) {
        // Silently fail - celebration is nice to have, not critical
      }
    };

    checkStreakMilestone();
  }, [streak?.current_streak]);

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
    <WebContainer>
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
          <Text style={styles.greeting}>{getGreeting()}</Text>
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

        <Text style={styles.sectionTitle}>Petit-déjeuner</Text>
        <BreakfastPhoto disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />

        <Text style={styles.sectionTitle}>Journal quotidien</Text>

        <View style={styles.cards}>
          <WeightInput disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <StepCounter disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <MealAdherence disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
          <ExerciseToggle disabled={isEnded || hasCheckedInForSelectedDate} selectedDate={selectedDate} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Enregistrez vos progrès pour débloquer le bilan
          </Text>
        </View>
        </ScrollView>

        {/* Confetti for streak milestones */}
        <ConfettiCelebration ref={confettiRef} />
      </SafeAreaView>
    </WebContainer>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 17) return 'Bon après-midi';
  return 'Bonsoir';
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

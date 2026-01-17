import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { getWeekdayNameForChallengeDay } from '@/lib/utils/dateHelpers';
import type { MealOption } from '@/lib/store/appStore';

interface MealDashboardProps {
  lockedWeeks: number[];
  activeWeek: number;
  onWeekChange: (week: number) => void;
  selections: Record<string, 'A' | 'B'>;
  mealOptions: MealOption[];
  deliveryPreference: 'home' | 'pickup' | null;
  nextUnlockedWeek: number | null;
  onSelectNextWeek: () => void;
  weekStartDate?: Date | null;
  cohortStartDate?: string;
  totalWeeks?: number;
}

export function MealDashboard({
  lockedWeeks,
  activeWeek,
  onWeekChange,
  selections,
  mealOptions,
  deliveryPreference,
  nextUnlockedWeek,
  onSelectNextWeek,
  weekStartDate,
  cohortStartDate,
  totalWeeks = 3,
}: MealDashboardProps) {
  // Get meal name from options
  const getMealName = (day: number, mealType: 'lunch' | 'dinner', option: 'A' | 'B'): string => {
    const mealOption = mealOptions.find(
      (m) => m.challenge_day === day && m.meal_type === mealType
    );
    if (!mealOption) return 'Unknown';
    return option === 'A' ? mealOption.option_a_name : mealOption.option_b_name;
  };

  // Format week start date
  const formatWeekStart = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if all weeks are locked
  const allWeeksLocked = lockedWeeks.length === totalWeeks;

  return (
    <View style={styles.container}>
      {/* Week Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {lockedWeeks.sort().map((week) => (
            <TouchableOpacity
              key={week}
              style={[styles.tab, activeWeek === week && styles.tabActive]}
              onPress={() => onWeekChange(week)}
            >
              <Text style={[styles.tabText, activeWeek === week && styles.tabTextActive]}>
                Week {week}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={activeWeek === week ? colors.success : colors.textMuted}
                style={styles.tabIcon}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Week {activeWeek} Meals</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.success} />
              <Text style={styles.statusText}>Locked</Text>
            </View>
            {weekStartDate && (
              <Text style={styles.dateText}>Starts {formatWeekStart(weekStartDate)}</Text>
            )}
          </View>
        </View>

        {/* Meal List */}
        <View style={styles.mealList}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const challengeDay = (activeWeek - 1) * 7 + day;
            const lunchSelection = selections[`${challengeDay}_lunch`];
            const dinnerSelection = selections[`${challengeDay}_dinner`];

            return (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayName}>
                  {cohortStartDate
                    ? getWeekdayNameForChallengeDay(cohortStartDate, activeWeek, day)
                    : `Day ${day}`}
                </Text>
                <View style={styles.mealsContainer}>
                  <View style={styles.mealRow}>
                    <Text style={styles.mealTypeLabel}>Lunch</Text>
                    <Text style={styles.mealName}>
                      {lunchSelection
                        ? getMealName(day, 'lunch', lunchSelection)
                        : 'Not selected'}
                    </Text>
                  </View>
                  <View style={styles.mealRow}>
                    <Text style={styles.mealTypeLabel}>Dinner</Text>
                    <Text style={styles.mealName}>
                      {dinnerSelection
                        ? getMealName(day, 'dinner', dinnerSelection)
                        : 'Not selected'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Method */}
        <View style={styles.deliveryCard}>
          <Ionicons
            name="home"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.deliveryText}>Home Delivery</Text>
        </View>

        {/* CTA Button or Completion Message */}
        <View style={styles.ctaContainer}>
          {allWeeksLocked ? (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={styles.completionTitle}>All Meals Selected!</Text>
              <Text style={styles.completionText}>
                You've completed meal selections for all {totalWeeks} weeks of your challenge.
              </Text>
            </View>
          ) : nextUnlockedWeek ? (
            <Button
              title={`Select Week ${nextUnlockedWeek} Meals →`}
              onPress={onSelectNextWeek}
              size="lg"
              fullWidth
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardAlt,
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primaryMuted,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabIcon: {
    marginLeft: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.small,
    color: colors.success,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mealList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayName: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mealsContainer: {
    gap: spacing.xs,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    width: 50,
  },
  mealName: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  deliveryText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  ctaContainer: {
    marginTop: spacing.md,
  },
  completionCard: {
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  completionTitle: {
    ...typography.h3,
    color: colors.success,
  },
  completionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

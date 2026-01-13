import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { getWeekdayNameForChallengeDay } from '@/lib/utils/dateHelpers';

interface MealReviewScreenProps {
  weekNumber: 1 | 2 | 3 | 4;
  selections: Record<string, 'A' | 'B'>;
  deliveryPreference: 'home' | 'pickup' | null;
  onEditDay?: (day: number) => void;
  onBack: () => void;
  onLock: () => void;
  isSubmitting?: boolean;
  cohortStartDate?: string;
}

export function MealReviewScreen({
  weekNumber,
  selections,
  deliveryPreference,
  onEditDay,
  onBack,
  onLock,
  isSubmitting = false,
  cohortStartDate,
}: MealReviewScreenProps) {
  // Group selections by day
  const getDaySelections = () => {
    const days: Array<{ day: number; lunch: string; dinner: string }> = [];

    for (let day = 1; day <= 7; day++) {
      const challengeDay = (weekNumber - 1) * 7 + day;
      const lunch = selections[`${challengeDay}_lunch`] || '—';
      const dinner = selections[`${challengeDay}_dinner`] || '—';

      days.push({ day, lunch, dinner });
    }

    return days;
  };

  const daySelections = getDaySelections();
  const hasAllSelections = daySelections.every((d) => d.lunch !== '—' && d.dinner !== '—');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Review Your Selections</Text>
          <Text style={styles.subtitle}>
            Check your meal choices for Week {weekNumber} before locking.
          </Text>
        </View>

        {/* Meal Selections Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Choices</Text>

          {daySelections.map(({ day, lunch, dinner }) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>Day {day}</Text>
                <Text style={styles.dayName}>
                  {cohortStartDate
                    ? getWeekdayNameForChallengeDay(cohortStartDate, weekNumber, day as 1 | 2 | 3 | 4 | 5 | 6 | 7)
                    : `Day ${day}`}
                </Text>
              </View>

              <View style={styles.mealsInfo}>
                <View style={styles.mealRow}>
                  <Text style={styles.mealType}>Lunch:</Text>
                  <Text
                    style={[
                      styles.mealOption,
                      lunch === '—' && styles.mealOptionMissing,
                    ]}
                  >
                    Option {lunch}
                  </Text>
                </View>
                <View style={styles.mealRow}>
                  <Text style={styles.mealType}>Dinner:</Text>
                  <Text
                    style={[
                      styles.mealOption,
                      dinner === '—' && styles.mealOptionMissing,
                    ]}
                  >
                    Option {dinner}
                  </Text>
                </View>
              </View>

              {onEditDay && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEditDay(day)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Delivery Preference Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="home"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.deliveryText}>Home Delivery</Text>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Once locked, selections cannot be changed
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <View style={styles.navButtons}>
          <View style={styles.navButton}>
            <Button title="◀ Back" onPress={onBack} variant="outline" />
          </View>

          <View style={styles.navButton}>
            <Button
              title={isSubmitting ? 'Confirming...' : 'Confirm Selection'}
              onPress={onLock}
              disabled={!hasAllSelections || !deliveryPreference || isSubmitting}
              variant="primary"
            />
          </View>
        </View>

        {(!hasAllSelections || !deliveryPreference) && (
          <Text style={styles.hint}>
            {!hasAllSelections && 'Complete all meal selections'}
            {!hasAllSelections && !deliveryPreference && ' and '}
            {!deliveryPreference && 'select delivery method'}
            {' to continue'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayInfo: {
    width: 80,
  },
  dayLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dayName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  mealsInfo: {
    flex: 1,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mealType: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 50,
  },
  mealOption: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  mealOptionMissing: {
    color: colors.textMuted,
  },
  editButton: {
    padding: spacing.sm,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deliveryText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

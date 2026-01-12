import { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MealSelector } from './MealSelector';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { getWeekdayNameForChallengeDay } from '@/lib/utils/dateHelpers';
import type { MealOption } from '@/lib/store/appStore';

interface DayMealSelectorProps {
  weekNumber: 1 | 2 | 3 | 4;
  currentDay: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  mealOptions: MealOption[];
  selections: Record<string, 'A' | 'B'>;
  onSelectMeal: (challengeDay: number, mealType: 'lunch' | 'dinner', option: 'A' | 'B') => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  disabled?: boolean;
  cohortStartDate?: string;
}

export function DayMealSelector({
  weekNumber,
  currentDay,
  mealOptions,
  selections,
  onSelectMeal,
  onPrevious,
  onNext,
  canGoPrevious,
  disabled = false,
  cohortStartDate,
}: DayMealSelectorProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate the actual challenge day (1-28)
  const challengeDay = (weekNumber - 1) * 7 + currentDay;

  // Get day name based on actual cohort start date
  const dayName = cohortStartDate
    ? getWeekdayNameForChallengeDay(cohortStartDate, weekNumber, currentDay)
    : `Day ${currentDay}`;

  // Get meal options for this day
  const lunchOptions = mealOptions.find(
    (m) => m.challenge_day === currentDay && m.meal_type === 'lunch'
  );
  const dinnerOptions = mealOptions.find(
    (m) => m.challenge_day === currentDay && m.meal_type === 'dinner'
  );

  // Get selections for this day (using underscore format to match sync.ts)
  const lunchSelection = selections[`${challengeDay}_lunch`] || null;
  const dinnerSelection = selections[`${challengeDay}_dinner`] || null;

  // Check if both meals are selected for this day
  const hasBothMealsSelected = lunchSelection !== null && dinnerSelection !== null;

  // Handle next with scroll to top
  const handleNext = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Header */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayNumber}>DAY {currentDay}</Text>
          <Text style={styles.dayName}>{dayName}</Text>
        </View>

        {/* Lunch Selection */}
        {lunchOptions && (
          <MealSelector
            challengeDay={challengeDay}
            mealType="lunch"
            optionA={{
              name: lunchOptions.option_a_name,
              description: lunchOptions.option_a_description,
              imageUrl: lunchOptions.option_a_image_url,
            }}
            optionB={{
              name: lunchOptions.option_b_name,
              description: lunchOptions.option_b_description,
              imageUrl: lunchOptions.option_b_image_url,
            }}
            selectedOption={lunchSelection}
            onSelect={(option) => onSelectMeal(challengeDay, 'lunch', option)}
            disabled={disabled}
          />
        )}

        {/* Dinner Selection */}
        {dinnerOptions && (
          <MealSelector
            challengeDay={challengeDay}
            mealType="dinner"
            optionA={{
              name: dinnerOptions.option_a_name,
              description: dinnerOptions.option_a_description,
              imageUrl: dinnerOptions.option_a_image_url,
            }}
            optionB={{
              name: dinnerOptions.option_b_name,
              description: dinnerOptions.option_b_description,
              imageUrl: dinnerOptions.option_b_image_url,
            }}
            selectedOption={dinnerSelection}
            onSelect={(option) => onSelectMeal(challengeDay, 'dinner', option)}
            disabled={disabled}
          />
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <View
              key={day}
              style={[
                styles.dot,
                day === currentDay && styles.dotActive,
                day < currentDay && styles.dotComplete,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <View style={styles.navButton}>
            <Button
              title="◀ Previous"
              onPress={onPrevious}
              disabled={!canGoPrevious}
              variant="outline"
            />
          </View>

          <View style={styles.navButton}>
            <Button
              title="Next ▶"
              onPress={handleNext}
              disabled={!hasBothMealsSelected}
              variant="primary"
            />
          </View>
        </View>

        {/* Day Progress Label */}
        <Text style={styles.progressLabel}>
          {hasBothMealsSelected
            ? `Day ${currentDay} of 7`
            : 'Select both lunch and dinner to continue'}
        </Text>
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
  dayHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dayNumber: {
    ...typography.small,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  dayName: {
    ...typography.h1,
    color: colors.text,
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardAlt,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotComplete: {
    backgroundColor: colors.success,
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
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

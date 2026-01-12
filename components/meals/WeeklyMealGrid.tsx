import { View, Text, StyleSheet } from 'react-native';
import { MealSelector } from './MealSelector';
import { MealOption } from '@/lib/store/appStore';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

interface WeeklyMealGridProps {
  weekNumber: 1 | 2 | 3 | 4;
  mealOptions: MealOption[];
  selections: Record<string, 'A' | 'B'>;
  onSelectMeal: (challengeDay: number, mealType: string, option: 'A' | 'B') => void;
  disabled?: boolean;
}

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export function WeeklyMealGrid({
  weekNumber,
  mealOptions,
  selections,
  onSelectMeal,
  disabled = false,
}: WeeklyMealGridProps) {
  // Group meal options by day
  const getMealsForDay = (day: number): { lunch: MealOption | null; dinner: MealOption | null } => {
    const lunch = mealOptions.find((m) => m.challenge_day === day && m.meal_type === 'lunch') || null;
    const dinner = mealOptions.find((m) => m.challenge_day === day && m.meal_type === 'dinner') || null;
    return { lunch, dinner };
  };

  const getSelection = (day: number, mealType: string): 'A' | 'B' | null => {
    const key = `${day}_${mealType}`;
    return selections[key] || null;
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
        const { lunch, dinner } = getMealsForDay(day);

        return (
          <View key={day} style={styles.dayContainer}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day - 1]}</Text>
              <View style={styles.dayProgress}>
                <Text style={styles.progressText}>
                  {(getSelection(day, 'lunch') ? 1 : 0) + (getSelection(day, 'dinner') ? 1 : 0)}/2
                </Text>
              </View>
            </View>

            {/* Lunch */}
            {lunch && (
              <MealSelector
                challengeDay={day}
                mealType="lunch"
                optionA={{
                  name: lunch.option_a_name,
                  description: lunch.option_a_description,
                  imageUrl: lunch.option_a_image_url,
                }}
                optionB={{
                  name: lunch.option_b_name,
                  description: lunch.option_b_description,
                  imageUrl: lunch.option_b_image_url,
                }}
                selectedOption={getSelection(day, 'lunch')}
                onSelect={(option) => onSelectMeal(day, 'lunch', option)}
                disabled={disabled}
              />
            )}

            {/* Dinner */}
            {dinner && (
              <MealSelector
                challengeDay={day}
                mealType="dinner"
                optionA={{
                  name: dinner.option_a_name,
                  description: dinner.option_a_description,
                  imageUrl: dinner.option_a_image_url,
                }}
                optionB={{
                  name: dinner.option_b_name,
                  description: dinner.option_b_description,
                  imageUrl: dinner.option_b_image_url,
                }}
                selectedOption={getSelection(day, 'dinner')}
                onSelect={(option) => onSelectMeal(day, 'dinner', option)}
                disabled={disabled}
              />
            )}

            {/* Divider (except last day) */}
            {day < 7 && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  dayContainer: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    ...typography.h3,
    color: colors.text,
  },
  dayProgress: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});

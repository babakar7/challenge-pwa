import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';
import { differenceInDays, parseISO } from 'date-fns';

const getToday = () => new Date().toISOString().split('T')[0];

// Calculate the week start (Sunday) for a given date
const getWeekStartForDate = (date: Date): string => {
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek; // Days since last Sunday
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - diff);
  return weekStart.toISOString().split('T')[0];
};

export function ExerciseToggle({ disabled = false, selectedDate = null }: { disabled?: boolean; selectedDate?: string | null }) {
  const targetDate = selectedDate || getToday();
  const targetDateObj = new Date(targetDate);
  const weekStart = getWeekStartForDate(targetDateObj);
  const completed = useAppStore((state) => state.weeklyExercise[weekStart] || false);
  const isLocked = useAppStore((state) => !!state.checkIns[targetDate]) || disabled;
  const cohort = useAppStore((state) => state.cohort);

  // Calculate challenge day for the target date
  const challengeDay = cohort ? differenceInDays(targetDateObj, parseISO(cohort.start_date)) + 1 : 0;

  // Only show on Sundays after at least one full week (day 7+)
  const isSunday = targetDateObj.getDay() === 0;

  if (!isSunday || challengeDay < 7) {
    return null;
  }

  // Locked state after check-in
  if (isLocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Exercice hebdo</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Dimanche</Text>
            </View>
          </View>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.lockedValue}>
          <Ionicons
            name={completed === true ? 'checkmark-circle' : completed === false ? 'close-circle' : 'ellipse-outline'}
            size={20}
            color={completed === true ? colors.success : completed === false ? colors.error : colors.textMuted}
          />
          <Text style={styles.lockedText}>
            {completed === true ? 'Fait' : completed === false ? 'Pas fait' : 'Non enregistré'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="fitness-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Exercice hebdo</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Dimanche</Text>
          </View>
        </View>
      </View>

      <Text style={styles.question}>Avez-vous fait de l'exercice 3 fois cette semaine ?</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            completed === true && styles.yesActive,
          ]}
          onPress={() => dataSync.updateWeeklyExercise(true, weekStart)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={completed === true ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={completed === true ? colors.card : colors.success}
          />
          <Text
            style={[
              styles.toggleText,
              completed === true && styles.toggleTextActive,
            ]}
          >
            Oui
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            completed === false && styles.noActive,
          ]}
          onPress={() => dataSync.updateWeeklyExercise(false, weekStart)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={completed === false ? 'close-circle' : 'close-circle-outline'}
            size={20}
            color={completed === false ? colors.card : colors.error}
          />
          <Text
            style={[
              styles.toggleText,
              completed === false && styles.toggleTextActive,
            ]}
          >
            Non
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLocked: {
    opacity: 0.7,
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  lockedText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.small,
    color: colors.primary,
  },
  question: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  yesActive: {
    backgroundColor: colors.success,
  },
  noActive: {
    backgroundColor: colors.error,
  },
  toggleText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.card,
  },
});

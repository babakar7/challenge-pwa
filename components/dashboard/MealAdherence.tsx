import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';

const getToday = () => new Date().toISOString().split('T')[0];

export function MealAdherence({ disabled = false, selectedDate = null }: { disabled?: boolean; selectedDate?: string | null }) {
  const targetDate = selectedDate || getToday();
  const adhered = useAppStore((state) => state.habits[targetDate]?.meal_adherence ?? null);
  const isLocked = useAppStore((state) => !!state.checkIns[targetDate]) || disabled;

  // Locked state after check-in
  if (isLocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf-outline" size={18} color={colors.meals} />
          </View>
          <Text style={styles.title}>Meal Plan</Text>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.lockedValue}>
          <Ionicons
            name={adhered === true ? 'checkmark-circle' : adhered === false ? 'close-circle' : 'ellipse-outline'}
            size={20}
            color={adhered === true ? colors.success : adhered === false ? colors.error : colors.textMuted}
          />
          <Text style={styles.lockedText}>
            {adhered === true ? 'Followed' : adhered === false ? 'Skipped' : 'Not recorded'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={18} color={colors.meals} />
        </View>
        <Text style={styles.title}>Meal Plan</Text>
      </View>

      <Text style={styles.question}>Did you follow your meal plan today?</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            adhered === true && styles.yesActive,
          ]}
          onPress={() => dataSync.updateMealAdherence(true, targetDate)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={adhered === true ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={adhered === true ? colors.card : colors.success}
          />
          <Text
            style={[
              styles.toggleText,
              adhered === true && styles.toggleTextActive,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            adhered === false && styles.noActive,
          ]}
          onPress={() => dataSync.updateMealAdherence(false, targetDate)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={adhered === false ? 'close-circle' : 'close-circle-outline'}
            size={20}
            color={adhered === false ? colors.card : colors.error}
          />
          <Text
            style={[
              styles.toggleText,
              adhered === false && styles.toggleTextActive,
            ]}
          >
            No
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.mealsMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
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

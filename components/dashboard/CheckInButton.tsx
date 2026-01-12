import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, shadows } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { format } from 'date-fns';

const getToday = () => new Date().toISOString().split('T')[0];

export function CheckInButton({ disabled = false, selectedDate = null }: { disabled?: boolean; selectedDate?: string | null }) {
  const router = useRouter();
  const { canCheckIn, checkIns, habits } = useAppStore();
  const targetDate = selectedDate || getToday();
  const alreadyCheckedIn = !!checkIns[targetDate];

  // Check if habits are complete for the target date
  const targetHabits = habits[targetDate];
  const hasRequiredHabits = targetHabits &&
    targetHabits.weight_kg !== null &&
    targetHabits.steps !== null &&
    targetHabits.meal_adherence !== null;

  const canDoCheckIn = hasRequiredHabits && !disabled;

  if (alreadyCheckedIn) {
    const isToday = targetDate === getToday();
    return (
      <View style={styles.completedCard}>
        <View style={styles.completedIcon}>
          <Ionicons name="checkmark" size={20} color={colors.success} />
        </View>
        <View style={styles.completedText}>
          <Text style={styles.completedTitle}>
            {isToday ? 'Done for today' : `Done for ${format(new Date(targetDate), 'MMM d')}`}
          </Text>
          <Text style={styles.completedSubtitle}>Check-in complete</Text>
        </View>
      </View>
    );
  }

  if (!canDoCheckIn) {
    return (
      <View style={styles.lockedCard}>
        <View style={styles.lockedIcon}>
          <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
        </View>
        <View style={styles.lockedText}>
          <Text style={styles.lockedTitle}>Check in</Text>
          <Text style={styles.lockedSubtitle}>Complete your daily log first</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.enabledCard}
      onPress={() => router.push('/check-in')}
      activeOpacity={0.9}
    >
      <View style={styles.enabledContent}>
        <View style={styles.enabledIcon}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>
        <View style={styles.enabledText}>
          <Text style={styles.enabledTitle}>Check in</Text>
          <Text style={styles.enabledSubtitle}>Ready to log your day</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Completed state
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  completedIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  completedText: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  completedSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Locked state
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  lockedIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  lockedText: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lockedSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Enabled state
  enabledCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  enabledContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enabledIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  enabledText: {
    flex: 1,
  },
  enabledTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  enabledSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

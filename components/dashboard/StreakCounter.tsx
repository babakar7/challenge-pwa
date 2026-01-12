import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';

export function StreakCounter() {
  const { streak } = useAppStore();

  // Hide when streak is 0
  if (streak.current_streak === 0) {
    return null;
  }

  const getMessage = () => {
    if (streak.current_streak >= 14) return "You're on fire!";
    if (streak.current_streak >= 7) return 'One week strong!';
    if (streak.current_streak >= 3) return 'Building momentum';
    return 'Keep it going';
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={24} color={colors.streak} />
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.value}>{streak.current_streak}</Text>
            <Text style={styles.label}>
              day{streak.current_streak !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.message}>{getMessage()}</Text>
        </View>

        {streak.longest_streak > streak.current_streak && (
          <View style={styles.bestBadge}>
            <Text style={styles.bestText}>Best {streak.longest_streak}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.streakMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  bestBadge: {
    backgroundColor: colors.warningMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
});

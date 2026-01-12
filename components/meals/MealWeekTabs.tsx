import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

interface MealWeekTabsProps {
  activeWeek: 1 | 2 | 3 | 4;
  onWeekChange: (week: 1 | 2 | 3 | 4) => void;
  lockedWeeks: number[];
  completionStatus: Record<number, { complete: boolean; count: number }>;
}

export function MealWeekTabs({
  activeWeek,
  onWeekChange,
  lockedWeeks,
  completionStatus,
}: MealWeekTabsProps) {
  const weeks: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {weeks.map((week) => {
        const isActive = activeWeek === week;
        const isLocked = lockedWeeks.includes(week);
        const status = completionStatus[week] || { complete: false, count: 0 };

        return (
          <TouchableOpacity
            key={week}
            style={[
              styles.tab,
              isActive && styles.tabActive,
              isLocked && styles.tabLocked,
            ]}
            onPress={() => onWeekChange(week)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  isLocked && styles.tabLabelLocked,
                ]}
              >
                Week {week}
              </Text>

              {isLocked ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.statusTextComplete}>Locked</Text>
                </View>
              ) : (
                <Text style={styles.statusText}>
                  {status.count}/14 selected
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: spacing.xs,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 100,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLocked: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tabLabelActive: {
    color: '#fff',
  },
  tabLabelLocked: {
    color: colors.success,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusTextComplete: {
    ...typography.caption,
    color: colors.success,
    marginLeft: 4,
  },
});

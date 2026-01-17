import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

type WizardStep = 'intro' | 'day' | 'delivery' | 'review';

interface WeekHeaderProps {
  weekNumber: number;
  currentStep: WizardStep;
  currentDay?: number;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  canGoPrevWeek?: boolean;
  canGoNextWeek?: boolean;
}

export function WeekHeader({
  weekNumber,
  currentStep,
  currentDay,
  onPrevWeek,
  onNextWeek,
  canGoPrevWeek = false,
  canGoNextWeek = false,
}: WeekHeaderProps) {
  // Generate step indicator text
  const getStepIndicator = () => {
    if (currentStep === 'intro') return 'Getting Started';
    if (currentStep === 'day' && currentDay) return `Day ${currentDay} of 7`;
    if (currentStep === 'delivery') return 'Delivery';
    if (currentStep === 'review') return 'Review';
    return '';
  };

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity
          style={[styles.weekArrow, !canGoPrevWeek && styles.weekArrowDisabled]}
          onPress={onPrevWeek}
          disabled={!canGoPrevWeek}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canGoPrevWeek ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>

        <Text style={styles.weekLabel}>Week {weekNumber}</Text>

        <TouchableOpacity
          style={[styles.weekArrow, !canGoNextWeek && styles.weekArrowDisabled]}
          onPress={onNextWeek}
          disabled={!canGoNextWeek}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={canGoNextWeek ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Step Indicator */}
      <Text style={styles.stepIndicator}>{getStepIndicator()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  weekArrow: {
    padding: spacing.xs,
  },
  weekArrowDisabled: {
    opacity: 0.3,
  },
  weekLabel: {
    ...typography.h2,
    color: colors.text,
    marginHorizontal: spacing.md,
  },
  stepIndicator: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

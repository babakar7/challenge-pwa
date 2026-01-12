import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { DeadlineWarning } from './DeadlineWarning';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import type { DeadlineUrgency } from './DeadlineWarning';

interface MealIntroScreenProps {
  weekNumber: 1 | 2 | 3 | 4;
  onGetStarted: () => void;
  deadline?: Date | null;
  deadlineCountdown?: string;
  urgency?: DeadlineUrgency;
}

export function MealIntroScreen({
  weekNumber,
  onGetStarted,
  deadline,
  deadlineCountdown,
  urgency = 'normal'
}: MealIntroScreenProps) {
  return (
    <View style={styles.container}>
      {/* Deadline Warning at Top */}
      {deadline && deadlineCountdown && (
        <View style={styles.deadlineContainer}>
          <DeadlineWarning
            weekNumber={weekNumber}
            countdown={deadlineCountdown}
            urgency={urgency}
          />
        </View>
      )}

      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="restaurant" size={48} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Select Your Meals</Text>

        {/* Description */}
        <Text style={styles.description}>
          Before your challenge {weekNumber === 1 ? 'begins' : 'week starts'}, choose your meals
          for Week {weekNumber}.
        </Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          <ChecklistItem text="Select lunch & dinner daily" />
          <ChecklistItem text="Choose Option A or B" />
          <ChecklistItem text="Pick your delivery method" />
          <ChecklistItem text="Lock when ready" />
        </View>

        {/* Get Started Button */}
        <Button title="Get Started" onPress={onGetStarted} variant="primary" />
      </View>
    </View>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      <Text style={styles.checklistText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  deadlineContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  checklist: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checklistText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
});

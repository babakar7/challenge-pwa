import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { DeadlineWarning } from './DeadlineWarning';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import type { DeadlineUrgency } from './DeadlineWarning';

interface MealIntroScreenProps {
  weekNumber: number;
  onGetStarted: () => void;
  deadline?: Date | null;
  deadlineCountdown?: string;
  urgency?: DeadlineUrgency;
  challengeStartDate?: string;
}

export function MealIntroScreen({
  weekNumber,
  onGetStarted,
  deadline,
  deadlineCountdown,
  urgency = 'normal',
  challengeStartDate
}: MealIntroScreenProps) {
  const formattedStartDate = challengeStartDate
    ? format(parseISO(challengeStartDate), 'd MMMM yyyy', { locale: fr })
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.title}>Sélectionnez vos repas</Text>

          {/* Challenge Start Date - show for Week 1 */}
          {weekNumber === 1 && formattedStartDate && (
            <View style={styles.startDateBadge}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.startDateText}>
                Le défi commence le {formattedStartDate}
              </Text>
            </View>
          )}

          {/* Checklist */}
          <View style={styles.checklist}>
            <ChecklistItem text="Sélectionnez déjeuner et dîner chaque jour" />
            <ChecklistItem text="Choisissez l'option A ou B" />
            <ChecklistItem text="Choisissez votre méthode de livraison" />
            <ChecklistItem text="Verrouillez quand vous êtes prêt" />
          </View>

          {/* Get Started Button */}
          <Button title="Commencer" onPress={onGetStarted} variant="primary" />
        </View>
      </ScrollView>
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xxl + spacing.xl,
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
  startDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  startDateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
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

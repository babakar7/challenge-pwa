import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { Button } from '@/components/ui/Button';
import { BlockingReason } from '@/lib/hooks/useMealSelectionGating';

interface MealSelectionRequiredScreenProps {
  reason: BlockingReason;
  weekNumber?: number;
}

export function MealSelectionRequiredScreen({
  reason,
  weekNumber = 1,
}: MealSelectionRequiredScreenProps) {
  const router = useRouter();

  const getContent = () => {
    if (reason === 'first_selection_required') {
      return {
        icon: 'restaurant',
        title: 'Select Your Meals',
        subtitle: 'Before starting your challenge, please select your meals for Week 1.',
        description:
          'Choose between Option A and Option B for each meal (lunch and dinner) for all 7 days. You can also select your delivery preference.',
        buttonText: 'Select Week 1 Meals',
      };
    }

    return {
      icon: 'alert-circle',
      title: 'Meal Selection Required',
      subtitle: `The deadline for Week ${weekNumber} meal selection has passed.`,
      description:
        'Please complete your meal selection as soon as possible. The kitchen needs your choices to prepare your meals.',
      buttonText: `Select Week ${weekNumber} Meals`,
    };
  };

  const content = getContent();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            reason === 'deadline_passed_without_selection' && styles.iconContainerError,
          ]}
        >
          <Ionicons
            name={content.icon as any}
            size={48}
            color={reason === 'deadline_passed_without_selection' ? colors.error : colors.primary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{content.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        {/* Description */}
        <Text style={styles.description}>{content.description}</Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.infoText}>Select lunch and dinner for 7 days</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.infoText}>Choose Option A or B for each meal</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.infoText}>Select delivery preference</Text>
          </View>
        </View>

        {/* Button */}
        <Button
          title={content.buttonText}
          onPress={() => router.push('/(tabs)/meals')}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainerError: {
    backgroundColor: colors.errorMuted,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

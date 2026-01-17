import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

export type DeadlineUrgency = 'normal' | 'urgent' | 'blocking';

interface DeadlineWarningProps {
  weekNumber: number;
  countdown: string;
  urgency: DeadlineUrgency;
  onPress?: () => void;
}

export function DeadlineWarning({
  weekNumber,
  countdown,
  urgency,
  onPress,
}: DeadlineWarningProps) {
  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'urgent':
        return {
          container: styles.containerUrgent,
          icon: colors.warning,
          title: styles.titleUrgent,
        };
      case 'blocking':
        return {
          container: styles.containerBlocking,
          icon: colors.error,
          title: styles.titleBlocking,
        };
      default:
        return {
          container: styles.containerNormal,
          icon: colors.primary,
          title: styles.titleNormal,
        };
    }
  };

  const urgencyStyles = getUrgencyStyles();

  const getMessage = () => {
    switch (urgency) {
      case 'urgent':
        return `Sélection repas semaine ${weekNumber} bientôt !`;
      case 'blocking':
        return `Avant le début de votre défi, choisissez vos repas pour la semaine ${weekNumber}`;
      default:
        return `Sélectionnez vos repas semaine ${weekNumber}`;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, urgencyStyles.container]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={urgency === 'blocking' ? 'alert-circle' : 'time'}
          size={24}
          color={urgencyStyles.icon}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, urgencyStyles.title]}>{getMessage()}</Text>
        {urgency !== 'blocking' && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  containerNormal: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  containerUrgent: {
    backgroundColor: colors.warningMuted,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  containerBlocking: {
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    marginBottom: 2,
  },
  titleNormal: {
    color: colors.primary,
  },
  titleUrgent: {
    color: colors.warning,
  },
  titleBlocking: {
    color: colors.error,
  },
  countdown: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

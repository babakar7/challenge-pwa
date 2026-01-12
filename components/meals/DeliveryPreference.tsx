import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

interface DeliveryPreferenceProps {
  selected: 'home' | 'pickup' | null;
  onSelect: (preference: 'home' | 'pickup') => void;
  disabled?: boolean;
}

export function DeliveryPreference({
  selected,
  onSelect,
  disabled = false,
}: DeliveryPreferenceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Preference</Text>
      <Text style={styles.subtitle}>How would you like to receive your meals?</Text>

      <View style={styles.optionsRow}>
        {/* Home Delivery Option */}
        <TouchableOpacity
          style={[
            styles.option,
            selected === 'home' && styles.optionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={() => onSelect('home')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              selected === 'home' && styles.iconContainerSelected,
            ]}
          >
            <Ionicons
              name="home"
              size={24}
              color={selected === 'home' ? '#fff' : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.optionLabel,
              selected === 'home' && styles.optionLabelSelected,
            ]}
          >
            Home Delivery
          </Text>
          <Text style={styles.optionDescription}>
            Meals delivered to your address
          </Text>
          {selected === 'home' && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* On-site Pickup Option */}
        <TouchableOpacity
          style={[
            styles.option,
            selected === 'pickup' && styles.optionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={() => onSelect('pickup')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              selected === 'pickup' && styles.iconContainerSelected,
            ]}
          >
            <Ionicons
              name="location"
              size={24}
              color={selected === 'pickup' ? '#fff' : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.optionLabel,
              selected === 'pickup' && styles.optionLabelSelected,
            ]}
          >
            On-site Pickup
          </Text>
          <Text style={styles.optionDescription}>
            Pick up at Revive center
          </Text>
          {selected === 'pickup' && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  spacer: {
    width: spacing.sm,
  },
});

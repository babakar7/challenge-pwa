import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

interface MealOptionCardProps {
  optionLabel: 'A' | 'B';
  name: string;
  description: string;
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function MealOptionCard({
  optionLabel,
  name,
  description,
  imageUrl,
  isSelected,
  onSelect,
  disabled = false,
}: MealOptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.optionBadge,
              isSelected && styles.optionBadgeSelected,
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
            >
              {optionLabel}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          )}
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.cardAlt,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionBadge: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  optionBadgeSelected: {
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: '#fff',
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { MealOptionCard } from './MealOptionCard';
import { colors, spacing, typography } from '@/lib/constants/theme';

interface MealSelectorProps {
  challengeDay: number;
  mealType: 'lunch' | 'dinner';
  optionA: {
    name: string;
    description: string;
    imageUrl: string;
  };
  optionB: {
    name: string;
    description: string;
    imageUrl: string;
  };
  selectedOption: 'A' | 'B' | null;
  onSelect: (option: 'A' | 'B') => void;
  disabled?: boolean;
}

export function MealSelector({
  challengeDay,
  mealType,
  optionA,
  optionB,
  selectedOption,
  onSelect,
  disabled = false,
}: MealSelectorProps) {
  const mealLabel = mealType === 'lunch' ? 'Lunch' : 'Dinner';

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.mealLabel}>{mealLabel}</Text>

      {/* Options */}
      <View style={styles.optionsRow}>
        <MealOptionCard
          optionLabel="A"
          name={optionA.name}
          description={optionA.description}
          imageUrl={optionA.imageUrl}
          isSelected={selectedOption === 'A'}
          onSelect={() => onSelect('A')}
          disabled={disabled}
        />

        <View style={styles.spacer} />

        <MealOptionCard
          optionLabel="B"
          name={optionB.name}
          description={optionB.description}
          imageUrl={optionB.imageUrl}
          isSelected={selectedOption === 'B'}
          onSelect={() => onSelect('B')}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  mealLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  spacer: {
    width: spacing.sm,
  },
});

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DeliveryPreference } from './DeliveryPreference';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/lib/constants/theme';

interface DeliveryPreferenceScreenProps {
  selected: 'home' | 'pickup' | null;
  onSelect: (preference: 'home' | 'pickup') => void;
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export function DeliveryPreferenceScreen({
  selected,
  onSelect,
  onBack,
  onNext,
  disabled = false,
}: DeliveryPreferenceScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Delivery Method</Text>
          <Text style={styles.subtitle}>
            Select how you'd like to receive your meals for this week.
          </Text>
        </View>

        {/* Delivery Preference Component */}
        <DeliveryPreference selected={selected} onSelect={onSelect} disabled={disabled} />
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <View style={styles.navButtons}>
          <View style={styles.navButton}>
            <Button title="◀ Back to Day 7" onPress={onBack} variant="outline" />
          </View>

          <View style={styles.navButton}>
            <Button
              title="Review ▶"
              onPress={onNext}
              disabled={!selected}
              variant="primary"
            />
          </View>
        </View>

        {!selected && (
          <Text style={styles.hint}>Please select a delivery method to continue</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

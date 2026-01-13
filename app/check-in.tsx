import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebContainer } from '@/components/ui/WebContainer';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';
import { Button } from '@/components/ui/Button';
import { haptics } from '@/lib/services/hapticService';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Difficult' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const ENERGY_OPTIONS = [
  { value: 1, label: 'Very Low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' },
];

const getToday = () => new Date().toISOString().split('T')[0];

export default function CheckInScreen() {
  const router = useRouter();
  const { getTodayHabits, getSelectedDateHabits, selectedDate, habits: allHabits, checkIns } = useAppStore();
  const targetDate = selectedDate || getToday();
  const habits = selectedDate ? getSelectedDateHabits() : getTodayHabits();

  // Check if can check in for the selected date
  const targetHabits = allHabits[targetDate];
  const hasRequiredHabits = targetHabits &&
    targetHabits.weight_kg !== null &&
    targetHabits.steps !== null &&
    targetHabits.meal_adherence !== null;
  const alreadyCheckedIn = !!checkIns[targetDate];
  const canDoCheckIn = hasRequiredHabits && !alreadyCheckedIn;

  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = mood !== null && energy !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    // Build challenges string with mood, energy, and notes
    const challengesText = [
      `Mood: ${mood}/5`,
      `Energy: ${energy}/5`,
      notes.trim() ? `Notes: ${notes.trim()}` : '',
    ].filter(Boolean).join(' | ');

    // Use sync layer for optimistic update + background sync
    await dataSync.submitCheckIn(challengesText, selectedDate || undefined);

    // Haptic feedback on success (native only)
    await haptics.light();

    setIsSubmitting(false);
    router.back();
  };

  if (!canDoCheckIn) {
    return (
      <WebContainer>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.lockedContainer}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.lockedTitle}>Check-in Locked</Text>
          <Text style={styles.lockedText}>
            Complete your daily log to unlock check-in.
          </Text>
          <View style={styles.habitsList}>
            <HabitStatus label="Weight logged" completed={habits.weight_kg !== null} />
            <HabitStatus label="Steps recorded" completed={habits.steps !== null && habits.steps > 0} />
            <HabitStatus label="Meal adherence" completed={habits.meal_adherence !== null} />
          </View>
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
        </SafeAreaView>
      </WebContainer>
    );
  }

  return (
    <WebContainer>
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <Text style={styles.sectionSubtitle}>Select your overall mood</Text>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.moodOption,
                    mood === option.value && styles.moodOptionSelected,
                  ]}
                  onPress={() => setMood(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      mood === option.value && styles.moodLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy Level</Text>
            <Text style={styles.sectionSubtitle}>How energetic did you feel?</Text>
            <View style={styles.energyContainer}>
              {ENERGY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.energyOption}
                  onPress={() => setEnergy(option.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.energyBar,
                      { height: option.value * 8 + 12 },
                      energy === option.value && styles.energyBarSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.energyLabel,
                      energy === option.value && styles.energyLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Any thoughts or reflections about today?
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem
                icon="scale-outline"
                label="Weight"
                value={habits.weight_kg ? `${habits.weight_kg} kg` : '--'}
              />
              <SummaryItem
                icon="footsteps-outline"
                label="Steps"
                value={habits.steps ? habits.steps.toLocaleString() : '--'}
              />
              <SummaryItem
                icon="restaurant-outline"
                label="Meals"
                value={habits.meal_adherence === null ? '--' : habits.meal_adherence ? 'Followed' : 'Skipped'}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isSubmitting ? 'Submitting...' : 'Complete Check-in'}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            size="lg"
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </WebContainer>
  );
}

function HabitStatus({ label, completed }: { label: string; completed: boolean }) {
  return (
    <View style={styles.habitStatus}>
      <Ionicons
        name={completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={completed ? colors.success : colors.textMuted}
      />
      <Text style={[styles.habitLabel, completed && styles.habitLabelCompleted]}>
        {label}
      </Text>
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    minWidth: 60,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodOptionSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  energyOption: {
    alignItems: 'center',
    flex: 1,
  },
  energyBar: {
    width: 32,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  energyBarSelected: {
    backgroundColor: colors.primary,
  },
  energyLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  energyLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summarySection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryValue: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: 2,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    marginBottom: 0,
  },
  // Locked state styles
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  lockedTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lockedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  habitsList: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  habitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  habitLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  habitLabelCompleted: {
    color: colors.text,
    textDecorationLine: 'line-through',
  },
  backButton: {
    minWidth: 150,
  },
});

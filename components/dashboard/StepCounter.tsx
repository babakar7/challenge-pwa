import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';

const STEP_GOAL = 10000;

const getToday = () => new Date().toISOString().split('T')[0];

export function StepCounter({ disabled = false, selectedDate = null }: { disabled?: boolean; selectedDate?: string | null }) {
  const targetDate = selectedDate || getToday();
  const steps = useAppStore((state) => state.habits[targetDate]?.steps ?? null);
  const isLocked = useAppStore((state) => !!state.checkIns[targetDate]) || disabled;
  const [inputValue, setInputValue] = useState(steps?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  const progress = steps ? Math.min(steps / STEP_GOAL, 1) : 0;
  const hasValue = steps !== null;

  const handleBlur = () => {
    const parsedSteps = parseInt(inputValue, 10);
    if (!isNaN(parsedSteps) && parsedSteps >= 0) {
      // Use sync layer for optimistic update + background sync
      dataSync.updateSteps(parsedSteps, targetDate);
    } else {
      // Reset to previous value if invalid
      setInputValue(steps?.toString() || '');
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isLocked) return;
    setIsEditing(true);
    setInputValue(steps?.toString() || '');
  };

  const formatSteps = (steps: number) => {
    return steps.toLocaleString();
  };

  // Locked state after check-in
  if (isLocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="footsteps" size={20} color={colors.steps} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Steps</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>
                {steps ? formatSteps(steps) : '--'}
              </Text>
              <Text style={styles.goal}>/ {formatSteps(STEP_GOAL)}</Text>
            </View>
          </View>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>
        {hasValue && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons name="footsteps" size={20} color={colors.steps} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Steps</Text>

          {hasValue && !isEditing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.valueRow}>
              <Text style={styles.value}>{formatSteps(steps!)}</Text>
              <Text style={styles.goal}>/ {formatSteps(STEP_GOAL)}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                onBlur={handleBlur}
                placeholder="Enter steps"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.inputGoal}>/ {formatSteps(STEP_GOAL)}</Text>
            </View>
          )}
        </View>

        {hasValue && !isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {hasValue && !isEditing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLocked: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.stepsMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  goal: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    minWidth: 100,
    height: 30,
    padding: 0,
  },
  inputGoal: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.stepsMuted,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.steps,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
});

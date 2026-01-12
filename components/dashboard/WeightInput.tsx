import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';

const getToday = () => new Date().toISOString().split('T')[0];

export function WeightInput({ disabled = false, selectedDate = null }: { disabled?: boolean; selectedDate?: string | null }) {
  const targetDate = selectedDate || getToday();
  const weight = useAppStore((state) => state.habits[targetDate]?.weight_kg ?? null);
  const isLocked = useAppStore((state) => !!state.checkIns[targetDate]) || disabled;
  const [inputValue, setInputValue] = useState(
    weight?.toString() || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleBlur = () => {
    const parsedWeight = parseFloat(inputValue);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      // Use sync layer for optimistic update + background sync
      dataSync.updateWeight(parsedWeight, targetDate);
    } else {
      // Reset to previous value if invalid
      setInputValue(weight?.toString() || '');
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isLocked) return;
    setIsEditing(true);
    setInputValue(weight?.toString() || '');
  };

  const hasValue = weight !== null;

  // Locked state after check-in
  if (isLocked) {
    return (
      <View style={[styles.card, styles.cardLocked]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="scale-outline" size={20} color={colors.weight} />
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>{weight ?? '--'}</Text>
              <Text style={styles.unit}>kg</Text>
            </View>
          </View>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons name="scale-outline" size={20} color={colors.weight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Weight</Text>

          {hasValue && !isEditing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.valueRow}>
              <Text style={styles.value}>{weight}</Text>
              <Text style={styles.unit}>kg</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                onBlur={handleBlur}
                placeholder="Enter weight"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          )}
        </View>

        {hasValue && !isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: colors.weightMuted,
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
  },
  unit: {
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
  inputUnit: {
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
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { colors, spacing, borderRadius } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';

const WATER_GOAL = 2500; // ml
const INCREMENT = 250; // ml

export function WaterTracker() {
  const { getTodayHabits, addWater, updateWater } = useAppStore();
  const habits = getTodayHabits();
  const currentWater = habits.water_ml;
  const progress = Math.min(currentWater / WATER_GOAL, 1);
  const glasses = Math.floor(currentWater / INCREMENT);

  const handleAdd = () => {
    addWater(INCREMENT);
  };

  const handleRemove = () => {
    if (currentWater >= INCREMENT) {
      updateWater(currentWater - INCREMENT);
    }
  };

  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.water + '20' }]}>
          <Ionicons name="water" size={24} color={colors.water} />
        </View>
        <Text style={styles.title}>Water</Text>
        <Text style={styles.goal}>{WATER_GOAL / 1000}L goal</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentWater >= 1000
            ? `${(currentWater / 1000).toFixed(1)}L`
            : `${currentWater}ml`}
        </Text>
      </View>

      <View style={styles.glassesContainer}>
        {[...Array(10)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.glass,
              i < glasses && styles.glassFilled,
            ]}
          >
            <Ionicons
              name="water"
              size={16}
              color={i < glasses ? colors.water : colors.border}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={handleRemove}
          disabled={currentWater < INCREMENT}
        >
          <Ionicons name="remove" size={24} color={currentWater < INCREMENT ? colors.border : colors.error} />
        </TouchableOpacity>

        <View style={styles.incrementInfo}>
          <Text style={styles.incrementText}>+{INCREMENT}ml</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  goal: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.water + '30',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.water,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.water,
    minWidth: 60,
    textAlign: 'right',
  },
  glassesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  glass: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassFilled: {
    backgroundColor: colors.water + '20',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: colors.error + '15',
  },
  addButton: {
    backgroundColor: colors.water,
  },
  incrementInfo: {
    paddingHorizontal: spacing.lg,
  },
  incrementText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppStore } from '@/lib/store/appStore';
import { colors, spacing, typography, borderRadius } from '@/lib/constants/theme';

export function DayNavigator() {
  const cohort = useAppStore(s => s.cohort);
  const selectedDate = useAppStore(s => s.selectedDate);
  const setSelectedDate = useAppStore(s => s.setSelectedDate);
  const getSelectedDayNumber = useAppStore(s => s.getSelectedDayNumber);
  const isViewingToday = useAppStore(s => s.isViewingToday);

  if (!cohort) return null;

  const dayNumber = getSelectedDayNumber();
  const isToday = isViewingToday();

  // Calculate date to display
  const currentDate = selectedDate ? new Date(selectedDate) : new Date();
  const dateDisplay = isToday ? 'Aujourd\'hui' : format(currentDate, 'd MMM', { locale: fr });

  // Navigation handlers
  const goToPreviousDay = () => {
    if (dayNumber <= 1) return;

    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    const previousDate = addDays(targetDate, -1);
    setSelectedDate(format(previousDate, 'yyyy-MM-dd'));
  };

  const goToNextDay = () => {
    if (isToday) return;

    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    const nextDate = addDays(targetDate, 1);
    const nextDateKey = format(nextDate, 'yyyy-MM-dd');
    const todayKey = format(new Date(), 'yyyy-MM-dd');

    // If next day is today, set to null to show "Today"
    if (nextDateKey === todayKey) {
      setSelectedDate(null);
    } else {
      setSelectedDate(nextDateKey);
    }
  };

  const canGoBack = dayNumber > 1;
  const canGoForward = !isToday;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.arrow, !canGoBack && styles.arrowDisabled]}
        onPress={goToPreviousDay}
        disabled={!canGoBack}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={canGoBack ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.dayInfo}>
        <Text style={styles.dayNumber}>Jour {dayNumber} sur 28</Text>
        <Text style={styles.dateDisplay}>{dateDisplay}</Text>
        {!isToday && (
          <Text style={styles.viewingPastLabel}>Jour passé</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.arrow, !canGoForward && styles.arrowDisabled]}
        onPress={goToNextDay}
        disabled={!canGoForward}
      >
        {canGoForward && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
  },
  arrowDisabled: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  dayInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  dayNumber: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateDisplay: {
    ...typography.body,
    color: colors.textSecondary,
  },
  viewingPastLabel: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});

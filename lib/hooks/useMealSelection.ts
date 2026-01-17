import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore, MealOption, MealSelection } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';
import { logger } from '@/lib/utils/logger';
import {
  getChallengeWeekDeadline,
  getDeadlineCountdown,
  formatDeadline,
} from '@/lib/utils/dateHelpers';

interface UseMealSelectionReturn {
  // Data
  mealOptions: MealOption[];
  selections: Record<string, 'A' | 'B'>;
  deliveryPreference: 'home' | 'pickup' | null;

  // State
  isLoading: boolean;
  isLocked: boolean;
  hasAllSelectionsComplete: boolean;
  selectionCount: number;
  totalRequired: number;

  // Deadline info
  deadline: Date | null;
  deadlineFormatted: string;
  deadlineCountdown: string;
  hoursUntilDeadline: number;
  isDeadlinePassed: boolean;
  isUrgent: boolean; // <24h

  // Actions
  selectMeal: (challengeDay: number, mealType: string, option: 'A' | 'B') => void;
  setDeliveryPreference: (preference: 'home' | 'pickup') => void;
  submitSelections: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useMealSelection(challengeWeek: number): UseMealSelectionReturn {
  const [isLoading, setIsLoading] = useState(true);

  // Get cohort info for deadline calculation
  const cohort = useAppStore((s) => s.cohort);

  // Get meal options from store
  const mealOptions = useAppStore((s) => s.mealOptions);

  // Get selection for this week
  const mealSelection = useAppStore((s) => s.getMealSelection(challengeWeek));

  // Extract values from selection
  const selections = mealSelection?.selections || {};
  const deliveryPreference = mealSelection?.delivery_preference || null;
  const isLocked = mealSelection?.locked || false;

  // Calculate deadline
  const deadline = useMemo(() => {
    if (!cohort?.start_date) return null;
    return getChallengeWeekDeadline(cohort.start_date, challengeWeek);
  }, [cohort?.start_date, challengeWeek]);

  // Deadline info
  const deadlineFormatted = deadline ? formatDeadline(deadline) : '';
  const deadlineCountdown = deadline ? getDeadlineCountdown(deadline) : '';

  const hoursUntilDeadline = useMemo(() => {
    if (!deadline) return 0;
    const now = new Date();
    const hours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours);
  }, [deadline]);

  const isDeadlinePassed = hoursUntilDeadline <= 0;
  const isUrgent = hoursUntilDeadline > 0 && hoursUntilDeadline < 24;

  // Check if all selections are complete (14 meals + delivery preference)
  const totalRequired = 14; // 7 days x 2 meals
  const selectionCount = Object.keys(selections).length;
  const hasAllSelectionsComplete =
    selectionCount === totalRequired && deliveryPreference !== null;

  // Load data when week changes
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        dataSync.loadMealOptions(challengeWeek),
        dataSync.loadMealSelection(challengeWeek),
      ]);
    } catch (error) {
      logger.error('Error loading meal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [challengeWeek]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Select a meal
  const selectMeal = useCallback(
    (challengeDay: number, mealType: string, option: 'A' | 'B') => {
      if (isLocked) return;
      dataSync.selectMeal(challengeWeek, challengeDay, mealType, option);
    },
    [challengeWeek, isLocked]
  );

  // Set delivery preference
  const handleSetDeliveryPreference = useCallback(
    (preference: 'home' | 'pickup') => {
      if (isLocked) return;
      dataSync.setDeliveryPreference(challengeWeek, preference);
    },
    [challengeWeek, isLocked]
  );

  // Submit and lock selections
  const submitSelections = useCallback(async (): Promise<boolean> => {
    if (!hasAllSelectionsComplete) {
      logger.error('Cannot submit: selections incomplete');
      return false;
    }

    if (isLocked) {
      logger.error('Cannot submit: already locked');
      return false;
    }

    const success = await dataSync.lockMealSelections(challengeWeek);
    return success;
  }, [challengeWeek, hasAllSelectionsComplete, isLocked]);

  return {
    // Data
    mealOptions,
    selections,
    deliveryPreference,

    // State
    isLoading,
    isLocked,
    hasAllSelectionsComplete,
    selectionCount,
    totalRequired,

    // Deadline info
    deadline,
    deadlineFormatted,
    deadlineCountdown,
    hoursUntilDeadline,
    isDeadlinePassed,
    isUrgent,

    // Actions
    selectMeal,
    setDeliveryPreference: handleSetDeliveryPreference,
    submitSelections,
    refreshData,
  };
}

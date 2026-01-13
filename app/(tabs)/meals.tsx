import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebContainer } from '@/components/ui/WebContainer';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { colors } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { useMealSelection } from '@/lib/hooks/useMealSelection';
import { logger } from '@/lib/utils/logger';
import {
  WeekHeader,
  MealIntroScreen,
  DayMealSelector,
  MealReviewScreen,
  MealDashboard,
} from '@/components/meals';

type WizardStep = 'intro' | 'day' | 'review';

export default function MealsScreen() {
  const router = useRouter();

  // Initialize with week 1, will be updated based on accessible weeks
  const [activeWeek, setActiveWeek] = useState<1 | 2 | 3 | 4>(1);
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [currentDay, setCurrentDay] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [showIntro, setShowIntro] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const hasInitialized = useRef(false);

  // Get meal selection data for active week
  const {
    mealOptions,
    selections,
    deliveryPreference,
    isLoading,
    isLocked,
    hasAllSelectionsComplete,
    deadline,
    deadlineCountdown,
    isDeadlinePassed,
    isUrgent,
    selectMeal,
    setDeliveryPreference,
    submitSelections,
  } = useMealSelection(activeWeek);

  // Get all meal selections for completion status
  const mealSelections = useAppStore((s) => s.mealSelections);

  // Get current challenge day to determine accessible weeks
  const getChallengeDay = useAppStore((s) => s.getChallengeDay);
  const currentChallengeDay = getChallengeDay();

  // Calculate locked weeks
  const lockedWeeks = useMemo(() => {
    return Object.entries(mealSelections)
      .filter(([_, sel]) => sel.locked)
      .map(([week]) => parseInt(week));
  }, [mealSelections]);

  // Calculate current challenge week (1-4) based on challenge day
  const currentChallengeWeek = useMemo(() => {
    if (currentChallengeDay === 0) return 0; // Not enrolled
    return Math.ceil(currentChallengeDay / 7) as 1 | 2 | 3 | 4;
  }, [currentChallengeDay]);

  // Determine which weeks are accessible
  const getAccessibleWeeks = useCallback(() => {
    const accessible: number[] = [];

    // Before challenge starts (day 0)
    if (currentChallengeDay === 0) {
      // Can always view locked weeks
      accessible.push(...lockedWeeks);

      // Find the highest locked week to determine next accessible
      const maxLockedWeek = lockedWeeks.length > 0 ? Math.max(...lockedWeeks) : 0;

      if (maxLockedWeek === 0) {
        // No weeks locked yet - can select Week 1
        accessible.push(1);
      } else if (maxLockedWeek < 4) {
        // Can select the next week after the highest locked week
        accessible.push(maxLockedWeek + 1);
      }
      // If all 4 weeks are locked, just show locked weeks (already added)

      return [...new Set(accessible)].sort();
    }

    // Can always view past/locked weeks
    accessible.push(...lockedWeeks);

    // Can access current week
    if (currentChallengeWeek > 0) {
      accessible.push(currentChallengeWeek);
    }

    // Can ONLY access next week if current week is locked
    if (currentChallengeWeek < 4 && lockedWeeks.includes(currentChallengeWeek)) {
      accessible.push(currentChallengeWeek + 1);
    }

    // Remove duplicates and sort
    return [...new Set(accessible)].sort();
  }, [currentChallengeDay, currentChallengeWeek, lockedWeeks]);

  const accessibleWeeks = getAccessibleWeeks();

  // Show dashboard when viewing any locked week
  const showDashboard = useMemo(() => {
    const result = isLocked && lockedWeeks.length > 0;
    logger.log('[MealsScreen] showDashboard calculation', { isLocked, lockedWeeks, result, activeWeek });
    return result;
  }, [isLocked, lockedWeeks, activeWeek]);

  // Get next unlocked week that's accessible
  const nextUnlockedWeek = useMemo(() => {
    // Find the first accessible week that's not locked
    const nextWeek = accessibleWeeks.find((week) => !lockedWeeks.includes(week));
    return nextWeek || null;
  }, [accessibleWeeks, lockedWeeks]);

  // Calculate week start date for dashboard
  const cohort = useAppStore((s) => s.cohort);
  const weekStartDate = useMemo(() => {
    if (!cohort?.start_date) return null;
    const cohortStart = new Date(cohort.start_date);
    const weekStart = new Date(cohortStart);
    weekStart.setDate(cohortStart.getDate() + (activeWeek - 1) * 7);
    return weekStart;
  }, [cohort?.start_date, activeWeek]);

  // Handler to start selecting next week
  const handleStartNextWeek = useCallback(() => {
    if (nextUnlockedWeek) {
      setActiveWeek(nextUnlockedWeek as typeof activeWeek);
      setShowIntro(true);
      setCurrentStep('intro');
      setCurrentDay(1);
    }
  }, [nextUnlockedWeek]);

  // Initialize activeWeek on first load only - redirect to first unlocked week
  useEffect(() => {
    logger.log('[MealsScreen] Init useEffect running', {
      hasInitialized: hasInitialized.current,
      accessibleWeeks,
      lockedWeeks,
      activeWeek
    });

    if (hasInitialized.current) {
      logger.log('[MealsScreen] Already initialized, skipping');
      return;
    }
    if (accessibleWeeks.length === 0) {
      logger.log('[MealsScreen] No accessible weeks yet, skipping');
      return;
    }

    hasInitialized.current = true;
    logger.log('[MealsScreen] Initializing...');

    // Find first unlocked accessible week
    const firstUnlockedWeek = accessibleWeeks.find(
      (week) => !lockedWeeks.includes(week)
    );

    logger.log('[MealsScreen] First unlocked week:', firstUnlockedWeek);

    if (firstUnlockedWeek && activeWeek !== firstUnlockedWeek) {
      logger.log('[MealsScreen] Redirecting to week', firstUnlockedWeek);
      setActiveWeek(firstUnlockedWeek as typeof activeWeek);
      setShowIntro(true);
      setCurrentStep('intro');
      setCurrentDay(1);
    } else if (!accessibleWeeks.includes(activeWeek)) {
      logger.log('[MealsScreen] Current week not accessible, going to', accessibleWeeks[0]);
      setActiveWeek(accessibleWeeks[0] as typeof activeWeek);
    }
  }, [accessibleWeeks, lockedWeeks]);

  // Determine if we should show intro on week load
  useEffect(() => {
    if (isLocked) {
      // If week is locked, go directly to review
      setCurrentStep('review');
      setShowIntro(false);
    } else if (showIntro && !isLocked) {
      // Show intro for unlocked weeks
      setCurrentStep('intro');
    } else {
      // Start at day 1 if intro dismissed
      setCurrentStep('day');
      setCurrentDay(1);
    }
  }, [isLocked, activeWeek]);

  // Navigation handlers
  const handleGetStarted = useCallback(() => {
    setShowIntro(false);
    setCurrentStep('day');
    setCurrentDay(1);
  }, []);

  const handlePrevDay = useCallback(() => {
    if (currentDay > 1) {
      setCurrentDay((d) => (d - 1) as typeof currentDay);
    }
  }, [currentDay]);

  const handleNextDay = useCallback(() => {
    if (currentDay < 7) {
      setCurrentDay((d) => (d + 1) as typeof currentDay);
    } else {
      // After day 7, auto-set delivery to home and go to review
      if (!deliveryPreference) {
        setDeliveryPreference('home');
      }
      setCurrentStep('review');
    }
  }, [currentDay, deliveryPreference, setDeliveryPreference]);

  const handleGoToDay = useCallback((day: number) => {
    setCurrentDay(day as typeof currentDay);
    setCurrentStep('day');
  }, []);

  const handleBackToDay7 = useCallback(() => {
    setCurrentDay(7);
    setCurrentStep('day');
  }, []);

  // Week navigation
  const handlePrevWeek = useCallback(() => {
    logger.log('[MealsScreen] handlePrevWeek called', { activeWeek, accessibleWeeks, lockedWeeks });
    if (activeWeek > 1) {
      const prevWeek = (activeWeek - 1) as typeof activeWeek;
      if (accessibleWeeks.includes(prevWeek)) {
        logger.log('[MealsScreen] Setting activeWeek to', prevWeek);
        setActiveWeek(prevWeek);
        // Only set showIntro if navigating to an unlocked week
        if (!lockedWeeks.includes(prevWeek)) {
          setShowIntro(true);
        }
      } else {
        Alert.alert(
          'Week Not Available',
          `Week ${prevWeek} is not yet accessible. You can only select meals for your current week and the upcoming week.`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [activeWeek, accessibleWeeks, lockedWeeks]);

  const handleNextWeek = useCallback(() => {
    logger.log('[MealsScreen] handleNextWeek called', { activeWeek, accessibleWeeks, lockedWeeks });
    if (activeWeek < 4) {
      const nextWeek = (activeWeek + 1) as typeof activeWeek;
      if (accessibleWeeks.includes(nextWeek)) {
        logger.log('[MealsScreen] Setting activeWeek to', nextWeek);
        setActiveWeek(nextWeek);
        // Only set showIntro if navigating to an unlocked week
        if (!lockedWeeks.includes(nextWeek)) {
          setShowIntro(true);
        }
      } else {
        Alert.alert(
          'Week Not Available',
          `Please complete and lock your Week ${activeWeek} meal selections before accessing Week ${nextWeek}.`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [activeWeek, accessibleWeeks]);

  // Submit handler - shows confirmation modal
  const handleSubmit = useCallback(() => {
    if (!hasAllSelectionsComplete) {
      Alert.alert(
        'Incomplete Selection',
        'Please select all meals and your delivery preference before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowLockModal(true);
  }, [hasAllSelectionsComplete]);

  // Handle confirmed lock from modal
  const handleConfirmLock = useCallback(async () => {
    setShowLockModal(false);
    setIsSubmitting(true);
    try {
      const success = await submitSelections();
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Error',
          'Failed to lock selections. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [submitSelections, router]);

  // Determine deadline urgency
  const getUrgency = () => {
    if (isDeadlinePassed) return 'blocking';
    if (isUrgent) return 'urgent';
    return 'normal';
  };

  // Render content based on current step
  const renderContent = () => {
    logger.log('[MealsScreen] renderContent', {
      isLoading,
      showDashboard,
      activeWeek,
      currentStep,
      isLocked
    });

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // Show dashboard when viewing a locked week
    if (showDashboard) {
      return (
        <MealDashboard
          lockedWeeks={lockedWeeks}
          activeWeek={activeWeek}
          onWeekChange={(week) => setActiveWeek(week as typeof activeWeek)}
          selections={selections}
          mealOptions={mealOptions}
          deliveryPreference={deliveryPreference}
          nextUnlockedWeek={nextUnlockedWeek}
          onSelectNextWeek={handleStartNextWeek}
          weekStartDate={weekStartDate}
          cohortStartDate={cohort?.start_date}
        />
      );
    }

    if (currentStep === 'intro' && !isLocked) {
      return (
        <MealIntroScreen
          weekNumber={activeWeek}
          onGetStarted={handleGetStarted}
          deadline={deadline}
          deadlineCountdown={deadlineCountdown}
          urgency={getUrgency()}
          challengeStartDate={cohort?.start_date}
        />
      );
    }

    if (currentStep === 'day') {
      return (
        <DayMealSelector
          weekNumber={activeWeek}
          currentDay={currentDay}
          mealOptions={mealOptions}
          selections={selections}
          onSelectMeal={selectMeal}
          onPrevious={handlePrevDay}
          onNext={handleNextDay}
          canGoPrevious={currentDay > 1}
          disabled={isLocked}
          cohortStartDate={cohort?.start_date}
        />
      );
    }

    if (currentStep === 'review') {
      return (
        <MealReviewScreen
          weekNumber={activeWeek}
          selections={selections}
          deliveryPreference={deliveryPreference}
          onEditDay={!isLocked ? handleGoToDay : undefined}
          onBack={handleBackToDay7}
          onLock={handleSubmit}
          isSubmitting={isSubmitting}
          cohortStartDate={cohort?.start_date}
        />
      );
    }

    return null;
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Week Header - hide when showing dashboard (it has its own tabs) */}
        {!showDashboard && (
          <WeekHeader
            weekNumber={activeWeek}
            currentStep={currentStep}
            currentDay={currentStep === 'day' ? currentDay : undefined}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            canGoPrevWeek={activeWeek > 1 && accessibleWeeks.includes(activeWeek - 1)}
            canGoNextWeek={activeWeek < 4 && accessibleWeeks.includes(activeWeek + 1)}
          />
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Lock Confirmation Modal */}
        <ConfirmationModal
          visible={showLockModal}
          title="Lock Selections"
          message={`Once locked, you cannot change your Week ${activeWeek} meal selections. Are you sure?`}
          confirmText="Lock Selections"
          cancelText="Cancel"
          onConfirm={handleConfirmLock}
          onCancel={() => setShowLockModal(false)}
        />
      </SafeAreaView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

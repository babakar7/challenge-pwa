import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { dataSync } from '@/lib/supabase/sync';
import { logger } from '@/lib/utils/logger';
import {
  getChallengeWeek,
  getChallengeWeekDeadline,
  getNextSelectionWeek,
  isBeforeChallengeStart,
  ChallengeWeekInfo,
} from '@/lib/utils/dateHelpers';

export type BlockingReason = 'first_selection_required' | 'deadline_passed_without_selection' | null;
export type BannerUrgency = 'normal' | 'urgent' | 'blocking';

interface UseMealSelectionGatingReturn {
  // Gating state
  shouldBlockDashboard: boolean;
  blockingReason: BlockingReason;

  // Week needing selection
  weekNeedingSelection: 1 | 2 | 3 | 4 | null;

  // UI helpers
  showDeadlineBanner: boolean;
  bannerUrgency: BannerUrgency;

  // Deadline info
  nextWeekInfo: ChallengeWeekInfo | null;

  // Loading
  isChecking: boolean;
}

export function useMealSelectionGating(): UseMealSelectionGatingReturn {
  const [isChecking, setIsChecking] = useState(true);
  const [hasWeek1Selection, setHasWeek1Selection] = useState<boolean | null>(null);

  // Get cohort and challenge state
  const cohort = useAppStore((s) => s.cohort);
  const challengeStatus = useAppStore((s) => s.getChallengeStatus());
  const challengeDay = useAppStore((s) => s.getChallengeDay());
  const mealSelections = useAppStore((s) => s.mealSelections);

  // Check if challenge is before start
  const isBeforeStart = useMemo(() => {
    if (!cohort?.start_date) return false;
    return isBeforeChallengeStart(cohort.start_date);
  }, [cohort?.start_date]);

  // Get the next week info that needs selection
  const nextWeekInfo = useMemo(() => {
    if (!cohort?.start_date) return null;
    return getNextSelectionWeek(cohort.start_date, challengeDay);
  }, [cohort?.start_date, challengeDay]);

  // Determine current week and check selections
  const currentWeek = useMemo(() => {
    if (challengeDay <= 0) return 1;
    return getChallengeWeek(challengeDay);
  }, [challengeDay]);

  // Check if user has completed selection for a given week
  const hasCompletedWeek = (weekNum: number): boolean => {
    const selection = mealSelections[weekNum];
    return selection?.locked === true;
  };

  // Check Week 1 selection status on mount
  useEffect(() => {
    const checkWeek1 = async () => {
      setIsChecking(true);
      try {
        const completed = await dataSync.hasCompletedMealSelection(1);
        setHasWeek1Selection(completed);
      } catch (error) {
        logger.error('Error checking week 1 selection:', error);
        setHasWeek1Selection(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if we're in a valid state
    if (challengeStatus === 'pending' || challengeStatus === 'active') {
      checkWeek1();
    } else {
      setIsChecking(false);
    }
  }, [challengeStatus]);

  // Determine blocking state
  const { shouldBlockDashboard, blockingReason, weekNeedingSelection } = useMemo(() => {
    // Not enrolled or ended - no blocking
    if (challengeStatus === 'not_enrolled' || challengeStatus === 'ended') {
      return {
        shouldBlockDashboard: false,
        blockingReason: null as BlockingReason,
        weekNeedingSelection: null as (1 | 2 | 3 | 4 | null),
      };
    }

    // Still checking - don't block yet
    if (isChecking || hasWeek1Selection === null) {
      return {
        shouldBlockDashboard: false,
        blockingReason: null as BlockingReason,
        weekNeedingSelection: null as (1 | 2 | 3 | 4 | null),
      };
    }

    // Before challenge starts or in pending state
    // User MUST complete Week 1 selection before accessing dashboard
    if (challengeStatus === 'pending' || isBeforeStart) {
      if (!hasWeek1Selection && !hasCompletedWeek(1)) {
        return {
          shouldBlockDashboard: true,
          blockingReason: 'first_selection_required' as BlockingReason,
          weekNeedingSelection: 1 as (1 | 2 | 3 | 4),
        };
      }
    }

    // During active challenge - check if deadline passed without selection
    if (challengeStatus === 'active' && nextWeekInfo) {
      const weekNum = nextWeekInfo.weekNumber;
      const isDeadlinePassed = nextWeekInfo.isDeadlinePassed;
      const hasSelection = hasCompletedWeek(weekNum);

      // Deadline passed and no selection - BLOCK
      if (isDeadlinePassed && !hasSelection) {
        return {
          shouldBlockDashboard: true,
          blockingReason: 'deadline_passed_without_selection' as BlockingReason,
          weekNeedingSelection: weekNum,
        };
      }

      // Deadline not passed, no selection yet - just show banner
      if (!hasSelection) {
        return {
          shouldBlockDashboard: false,
          blockingReason: null as BlockingReason,
          weekNeedingSelection: weekNum,
        };
      }
    }

    return {
      shouldBlockDashboard: false,
      blockingReason: null as BlockingReason,
      weekNeedingSelection: null as (1 | 2 | 3 | 4 | null),
    };
  }, [
    challengeStatus,
    isChecking,
    hasWeek1Selection,
    isBeforeStart,
    nextWeekInfo,
    mealSelections,
  ]);

  // Determine banner urgency
  const { showDeadlineBanner, bannerUrgency } = useMemo(() => {
    // Don't show banner if no week needs selection or if blocked
    if (!weekNeedingSelection || shouldBlockDashboard) {
      return { showDeadlineBanner: false, bannerUrgency: 'normal' as BannerUrgency };
    }

    // Check if already completed
    if (hasCompletedWeek(weekNeedingSelection)) {
      return { showDeadlineBanner: false, bannerUrgency: 'normal' as BannerUrgency };
    }

    // Show banner with appropriate urgency
    if (nextWeekInfo?.isLessThan24Hours) {
      return { showDeadlineBanner: true, bannerUrgency: 'urgent' as BannerUrgency };
    }

    return { showDeadlineBanner: true, bannerUrgency: 'normal' as BannerUrgency };
  }, [weekNeedingSelection, shouldBlockDashboard, nextWeekInfo, mealSelections]);

  return {
    shouldBlockDashboard,
    blockingReason,
    weekNeedingSelection,
    showDeadlineBanner,
    bannerUrgency,
    nextWeekInfo,
    isChecking,
  };
}

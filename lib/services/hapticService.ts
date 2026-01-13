import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/utils/logger';

/**
 * Haptic feedback service - Native only (skipped on web/PWA)
 */
export const haptics = {
  /**
   * Light impact - for minor interactions (check-in success)
   */
  light: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.error('[Haptics] Light impact failed:', error);
    }
  },

  /**
   * Success notification - for completed actions (meal lock)
   */
  success: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('[Haptics] Success notification failed:', error);
    }
  },

  /**
   * Heavy impact - for milestones (streak achievements)
   */
  heavy: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      logger.error('[Haptics] Heavy impact failed:', error);
    }
  },

  /**
   * Selection feedback - for UI selections
   */
  selection: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      logger.error('[Haptics] Selection failed:', error);
    }
  },
};

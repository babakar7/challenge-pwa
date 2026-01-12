import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers for push notifications and returns the Expo push token.
 * Returns null if registration fails or permissions are denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Must be physical device
  if (!Device.isDevice) {
    logger.log('[Notifications] Push notifications require a physical device');
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.log('[Notifications] Push notification permission denied');
    return null;
  }

  try {
    // Get project ID from Expo config
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      logger.log('[Notifications] No projectId configured. Run "eas init" to set up EAS for push notifications.');
      logger.log('[Notifications] Push notifications will work once EAS is configured and app is rebuilt.');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

    logger.log('[Notifications] Push token obtained:', tokenData.data);

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C547D',
      });
    }

    return tokenData.data;
  } catch (error) {
    logger.error('[Notifications] Error getting push token:', error);
    return null;
  }
}

/**
 * Saves the push token to the user's profile in Supabase.
 */
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) {
      logger.error('[Notifications] Error saving push token:', error);
    } else {
      logger.log('[Notifications] Push token saved to profile');
    }
  } catch (error) {
    logger.error('[Notifications] Error saving push token:', error);
  }
}

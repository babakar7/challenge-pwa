import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { registerForPushNotifications, savePushToken } from '@/lib/services/notificationService';
import { useAuth } from '@/lib/context/AuthContext';
import { logger } from '@/lib/utils/logger';

/**
 * Hook to register for push notifications and handle notification taps.
 * Should be called once at the app root level.
 * Note: Push notifications are not supported on web.
 */
export function useNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Skip notifications on web - not supported
    if (Platform.OS === 'web') return;
    if (!user) return;

    // Register and save push token
    registerForPushNotifications().then((token) => {
      if (token) {
        savePushToken(user.id, token);
      }
    });

    // Handle notification taps (when user taps a notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const type = data?.type as string | undefined;

        logger.log('[Notifications] Notification tapped:', type);

        // Navigate based on notification type
        if (type === 'check-in-reminder') {
          router.push('/check-in');
        } else if (type === 'meal-selection-reminder') {
          router.push('/(tabs)/meals');
        }
      }
    );

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user, router]);
}

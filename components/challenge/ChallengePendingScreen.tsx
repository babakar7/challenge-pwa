import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppStore } from '@/lib/store/appStore';
import { colors, spacing, typography, borderRadius } from '@/lib/constants/theme';
import { logger } from '@/lib/utils/logger';

export function ChallengePendingScreen() {
  const { signOut } = useAuth();
  const cohort = useAppStore(s => s.cohort);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!cohort) return;

    const updateCountdown = () => {
      const now = new Date();
      const startDate = parseISO(cohort.start_date);

      const days = differenceInDays(startDate, now);
      const hours = differenceInHours(startDate, now) % 24;
      const minutes = differenceInMinutes(startDate, now) % 60;

      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [cohort]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        logger.error('Logout error:', error);
        if (Platform.OS === 'web') {
          window.alert('Échec de la déconnexion. Veuillez réessayer.');
        } else {
          Alert.alert('Erreur', 'Échec de la déconnexion. Veuillez réessayer.');
        }
      }
    } catch (error) {
      logger.error('Logout error:', error);
      if (Platform.OS === 'web') {
        window.alert('Échec de la déconnexion. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Échec de la déconnexion. Veuillez réessayer.');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!cohort) return null;

  const formattedDate = format(parseISO(cohort.start_date), 'd MMMM yyyy', { locale: fr });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={80} color={colors.primary} />
        </View>

        <Text style={styles.challengeName}>{cohort.name}</Text>
        <Text style={styles.title}>Le défi commence bientôt</Text>
        <Text style={styles.message}>
          Votre défi commence le {formattedDate}
        </Text>

        <View style={styles.countdownContainer}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownValue}>{timeLeft.days}</Text>
            <Text style={styles.countdownLabel}>Jours</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownValue}>{timeLeft.hours}</Text>
            <Text style={styles.countdownLabel}>Heures</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownValue}>{timeLeft.minutes}</Text>
            <Text style={styles.countdownLabel}>Minutes</Text>
          </View>
        </View>

        <Text style={styles.submessage}>
          Vous pourrez commencer à enregistrer vos habitudes lorsque le défi commencera.
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
          )}
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  challengeName: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  countdownItem: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    minWidth: 80,
  },
  countdownValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 36,
  },
  countdownLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  submessage: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    marginTop: spacing.xl,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/context/AuthContext';
import { colors, spacing, typography, borderRadius } from '@/lib/constants/theme';
import { logger } from '@/lib/utils/logger';

export function NotEnrolledScreen() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      } else if (Platform.OS === 'web') {
        // Force page reload on web to ensure clean state
        window.location.reload();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={80} color={colors.textMuted} />
        </View>

        <Text style={styles.title}>Pas de défi actif</Text>
        <Text style={styles.message}>
          Vous n'êtes actuellement inscrit à aucun défi.
        </Text>
        <Text style={styles.submessage}>
          Contactez Revive pour rejoindre le prochain défi.
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
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
    marginBottom: spacing.xl,
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
    marginBottom: spacing.sm,
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
    backgroundColor: colors.errorMuted,
    marginTop: spacing.xl,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});

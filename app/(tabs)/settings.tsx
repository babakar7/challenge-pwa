import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebContainer } from '@/components/ui/WebContainer';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { useAuth } from '@/lib/context/AuthContext';
import { dataSync } from '@/lib/supabase/sync';
import { logger } from '@/lib/utils/logger';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Clear local data
              dataSync.clearUserData();

              // Sign out from Supabase
              const { error } = await signOut();
              if (error) {
                Alert.alert('Erreur', 'Échec de la déconnexion. Veuillez réessayer.');
                logger.error('Logout error:', error);
              }
              // Auth state change listener will handle navigation
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la déconnexion. Veuillez réessayer.');
              logger.error('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Supprimer le compte',
      'Ceci supprimera définitivement toutes vos données, y compris l\'historique de poids, les bilans, les sélections de repas et les progrès. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer le compte',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Êtes-vous absolument sûr ?',
              'Toutes vos données de défi seront définitivement supprimées.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Oui, tout supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    try {
                      // Delete all user data
                      const success = await dataSync.deleteAccountData();

                      if (success) {
                        // Sign out after deletion
                        await signOut();
                        Alert.alert(
                          'Compte supprimé',
                          'Les données de votre compte ont été supprimées.'
                        );
                      } else {
                        Alert.alert(
                          'Erreur',
                          'Échec de la suppression des données. Veuillez réessayer.'
                        );
                      }
                    } catch (error) {
                      Alert.alert(
                        'Erreur',
                        'Échec de la suppression du compte. Veuillez réessayer.'
                      );
                      logger.error('Delete account error:', error);
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <WebContainer>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Paramètres</Text>
          </View>

          <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.rowValue}>{user?.email || 'Non connecté'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={handleLogout}
            disabled={isLoggingOut || isDeletingAccount}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, styles.logoutText]}>
                  {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Danger Zone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone danger</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={handleDeleteAccount}
            disabled={isLoggingOut || isDeletingAccount}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, styles.logoutText]}>
                  {isDeletingAccount ? 'Suppression...' : 'Supprimer le compte'}
                </Text>
                <Text style={styles.rowValue}>
                  Supprimer définitivement toutes vos données
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Revive Challenge</Text>
                <Text style={styles.rowValue}>Version 1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Légal</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Politique de confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/terms')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Conditions d'utilisation</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logoutIconContainer: {
    backgroundColor: colors.errorMuted,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutText: {
    color: colors.error,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
});

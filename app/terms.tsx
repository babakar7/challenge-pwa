import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the Revive Challenge application ("App"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms, please do
            not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Revive Challenge is a 28-day weight loss challenge application that helps users
            track daily habits, select meals, and maintain accountability through daily check-ins.
            The App is designed to support your wellness journey but is not a substitute for
            professional medical advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use the App, you must be assigned an account by an administrator. You are
            responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
          <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
          <Text style={styles.bulletPoint}>• Notifying us of any unauthorized use</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <Text style={styles.bulletPoint}>• Use the App for any unlawful purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
          <Text style={styles.bulletPoint}>• Interfere with the proper functioning of the App</Text>
          <Text style={styles.bulletPoint}>• Share your account credentials with others</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Health Disclaimer</Text>
          <Text style={styles.paragraph}>
            The App provides general wellness tracking and is not intended to diagnose, treat,
            cure, or prevent any disease. Always consult with a qualified healthcare provider
            before starting any diet, exercise, or wellness program.
          </Text>
          <Text style={styles.paragraph}>
            The meal plans and recommendations provided are for informational purposes only.
            Individual results may vary, and we make no guarantees regarding weight loss or
            health outcomes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Meal Selections</Text>
          <Text style={styles.paragraph}>
            Meal selections must be completed before the specified deadlines. Once locked,
            selections cannot be changed. It is your responsibility to:
          </Text>
          <Text style={styles.bulletPoint}>• Review your selections carefully before locking</Text>
          <Text style={styles.bulletPoint}>• Inform us of any food allergies or dietary restrictions</Text>
          <Text style={styles.bulletPoint}>• Meet all meal selection deadlines</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The App and its original content, features, and functionality are owned by
            Revive Challenge and are protected by international copyright, trademark, and
            other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, Revive Challenge shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages resulting
            from your use of or inability to use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account at any time, without
            notice, for conduct that we believe violates these Terms or is harmful to other
            users, us, or third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of
            any material changes through the App. Your continued use of the App after such
            modifications constitutes acceptance of the updated Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>support@revivechallenge.com</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingLeft: spacing.sm,
  },
  contactEmail: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});

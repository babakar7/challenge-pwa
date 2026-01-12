import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Revive Challenge ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information
            when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>We collect the following types of information:</Text>

          <Text style={styles.subheading}>Account Information</Text>
          <Text style={styles.bulletPoint}>• Email address (for authentication)</Text>
          <Text style={styles.bulletPoint}>• Name (optional, for personalization)</Text>

          <Text style={styles.subheading}>Health & Fitness Data</Text>
          <Text style={styles.bulletPoint}>• Daily weight measurements</Text>
          <Text style={styles.bulletPoint}>• Step count</Text>
          <Text style={styles.bulletPoint}>• Water intake</Text>
          <Text style={styles.bulletPoint}>• Meal adherence tracking</Text>
          <Text style={styles.bulletPoint}>• Weekly exercise completion</Text>

          <Text style={styles.subheading}>Challenge Data</Text>
          <Text style={styles.bulletPoint}>• Meal selections and preferences</Text>
          <Text style={styles.bulletPoint}>• Daily check-in reflections</Text>
          <Text style={styles.bulletPoint}>• Streak and progress information</Text>

          <Text style={styles.subheading}>Device Information</Text>
          <Text style={styles.bulletPoint}>• Push notification token (for reminders)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use your information to:</Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the challenge tracking service</Text>
          <Text style={styles.bulletPoint}>• Track your progress throughout the 28-day challenge</Text>
          <Text style={styles.bulletPoint}>• Send you reminders and notifications</Text>
          <Text style={styles.bulletPoint}>• Improve our services and user experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage & Security</Text>
          <Text style={styles.paragraph}>
            Your data is securely stored using Supabase, a trusted cloud database provider.
            We implement appropriate security measures to protect your personal information
            against unauthorized access, alteration, or destruction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>We use the following third-party services:</Text>
          <Text style={styles.bulletPoint}>• Supabase - Database and authentication</Text>
          <Text style={styles.bulletPoint}>• Expo - Push notifications</Text>
          <Text style={styles.paragraph}>
            These services have their own privacy policies governing the use of your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as your account is active or as
            needed to provide you services. You can request deletion of your data at any time
            through the Settings screen in the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>You have the right to:</Text>
          <Text style={styles.bulletPoint}>• Access your personal data</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Delete your account and all associated data</Text>
          <Text style={styles.bulletPoint}>• Opt out of push notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not directed to individuals under 18. We do not knowingly collect
            personal information from children under 18.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy within the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:
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
  subheading: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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

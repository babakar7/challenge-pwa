import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { WebContainer } from '@/components/ui/WebContainer';
import { colors, spacing, borderRadius, typography } from '@/lib/constants/theme';
import { useAppStore } from '@/lib/store/appStore';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/lib/utils/responsive';

export default function ProgressScreen() {
  const { habits, checkIns, streak, weightHistory } = useAppStore();
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useResponsive();

  // Use max content width on desktop, screen width on mobile
  const chartWidth = isDesktop
    ? MAX_CONTENT_WIDTH - spacing.lg * 2 - spacing.md * 2
    : screenWidth - spacing.lg * 2 - spacing.md * 2;

  // Get weight data for chart (last 28 days)
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    let lastKnownWeight = 0;

    // Generate last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayHabit = habits[date];

      // Only show every 7th label to avoid crowding
      if (i % 7 === 0 || i === 0) {
        labels.push(format(subDays(new Date(), i), 'M/d'));
      } else {
        labels.push('');
      }

      if (dayHabit?.weight_kg) {
        lastKnownWeight = dayHabit.weight_kg;
        data.push(dayHabit.weight_kg);
      } else if (lastKnownWeight > 0) {
        // Fill with last known weight for continuity
        data.push(lastKnownWeight);
      } else {
        data.push(0);
      }
    }

    // Filter out leading zeros
    let firstNonZero = data.findIndex(v => v > 0);
    if (firstNonZero === -1) firstNonZero = 0;

    const filteredData = data.slice(firstNonZero);
    const filteredLabels = labels.slice(firstNonZero);

    return {
      labels: filteredLabels.length > 0 ? filteredLabels : [''],
      datasets: [{ data: filteredData.length > 0 ? filteredData : [0] }],
    };
  }, [habits]);

  // Calculate stats
  const stats = useMemo(() => {
    const weights = Object.entries(habits)
      .filter(([_, h]) => h.weight_kg !== null && h.weight_kg > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, h]) => h.weight_kg as number);

    if (weights.length === 0) {
      return {
        starting: null,
        current: null,
        change: 0,
        avgSteps: 0,
        checkInCount: Object.keys(checkIns).length,
        daysTracked: 0,
      };
    }

    const starting = weights[0];
    const current = weights[weights.length - 1];
    const change = current - starting;

    const stepValues = Object.values(habits)
      .map(h => h.steps)
      .filter((s): s is number => s !== null && s > 0);

    return {
      starting,
      current,
      change,
      avgSteps: stepValues.length > 0
        ? Math.round(stepValues.reduce((a, b) => a + b, 0) / stepValues.length)
        : 0,
      checkInCount: Object.keys(checkIns).length,
      daysTracked: weights.length,
    };
  }, [habits, checkIns]);

  // Get recent check-ins
  const recentCheckIns = useMemo(() => {
    return Object.entries(checkIns)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 5);
  }, [checkIns]);

  const hasData = stats.current !== null;

  return (
    <WebContainer>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.title}>Vos progrès</Text>

        {!hasData ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Pas encore de données</Text>
            <Text style={styles.emptyText}>
              Commencez à suivre votre poids pour voir votre graphique de progression ici.
            </Text>
          </Card>
        ) : (
          <>
            {/* Weight Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>Évolution du poids</Text>
              <Text style={styles.chartSubtitle}>28 derniers jours</Text>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={200}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(124, 84, 125, ${opacity})`,
                  labelColor: () => colors.textSecondary,
                  style: {
                    borderRadius: borderRadius.md,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: colors.primary,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: colors.border,
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                fromZero={false}
              />
            </Card>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="scale-outline"
                label="Départ"
                value={stats.starting ? `${stats.starting} kg` : '--'}
                color={colors.textSecondary}
              />
              <StatCard
                icon="fitness-outline"
                label="Actuel"
                value={stats.current ? `${stats.current} kg` : '--'}
                color={colors.primary}
              />
              <StatCard
                icon={stats.change <= 0 ? "trending-down-outline" : "trending-up-outline"}
                label="Variation"
                value={stats.change !== 0 ? `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)} kg` : '--'}
                color={stats.change < 0 ? colors.success : stats.change > 0 ? colors.error : colors.textSecondary}
              />
              <StatCard
                icon="flame-outline"
                label="Série"
                value={`${streak.current_streak} jours`}
                color={colors.streak}
              />
            </View>

            {/* Summary Stats */}
            <Card style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Résumé</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="footsteps-outline" size={24} color={colors.steps} />
                  <Text style={styles.summaryValue}>{stats.avgSteps.toLocaleString()}</Text>
                  <Text style={styles.summaryLabel}>Moy. pas</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                  <Text style={styles.summaryValue}>{stats.checkInCount}</Text>
                  <Text style={styles.summaryLabel}>Bilans</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                  <Text style={styles.summaryValue}>{stats.daysTracked}</Text>
                  <Text style={styles.summaryLabel}>Jours suivis</Text>
                </View>
              </View>
            </Card>

            {/* Longest Streak */}
            {streak.longest_streak > 0 && (
              <Card style={styles.longestStreakCard}>
                <View style={styles.longestStreakContent}>
                  <View style={styles.longestStreakIcon}>
                    <Ionicons name="trophy" size={28} color={colors.warning} />
                  </View>
                  <View style={styles.longestStreakText}>
                    <Text style={styles.longestStreakLabel}>Plus longue série</Text>
                    <Text style={styles.longestStreakValue}>{streak.longest_streak} jours</Text>
                  </View>
                </View>
              </Card>
            )}
          </>
        )}

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <Card style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Bilans récents</Text>
            {recentCheckIns.map(([date, checkIn]) => (
              <View key={date} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>
                    {format(parseISO(date), 'd MMM', { locale: fr })}
                  </Text>
                </View>
                <View style={styles.historyContent}>
                  {checkIn.challenges_faced ? (
                    <Text style={styles.historyChallenges} numberOfLines={2}>
                      {checkIn.challenges_faced}
                    </Text>
                  ) : (
                    <Text style={styles.historyNoNotes}>Pas de notes</Text>
                  )}
                </View>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
            ))}
          </Card>
        )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </WebContainer>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
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
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  chartCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chart: {
    marginLeft: -spacing.sm,
    borderRadius: borderRadius.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  longestStreakCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
  },
  longestStreakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  longestStreakIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  longestStreakText: {
    flex: 1,
  },
  longestStreakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  longestStreakValue: {
    ...typography.h2,
    color: colors.text,
  },
  historyCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    width: 50,
  },
  historyDateText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  historyContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  historyChallenges: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyNoNotes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});

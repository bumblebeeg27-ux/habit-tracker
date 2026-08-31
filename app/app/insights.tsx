import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../src/db/client';
import { attendanceRecord, userProfile } from '../src/db/schema';
import { getActiveProgramRow, getWeeklySchedule } from '../src/db/repositories/workoutProgram';
import { computeConsistencyInsights, ConsistencyInsights } from '../src/services/insights';
import { WorkoutProgram } from '../src/types/workout';

export default function InsightsScreen() {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: attendanceRows } = useLiveQuery(db.select().from(attendanceRecord));
  const profile = profiles?.[0];

  const [insights, setInsights] = useState<ConsistencyInsights | null>(null);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    async function load() {
      const row = await getActiveProgramRow();
      if (!row) return;
      const parsedProgram = JSON.parse(row.planJson) as WorkoutProgram;
      const schedule = await getWeeklySchedule();
      if (!schedule) return;
      setProgram(parsedProgram);
      setInsights(
        computeConsistencyInsights(parsedProgram, schedule, attendanceRows ?? [], new Date(row.createdAt)),
      );
    }
    load();
  }, [attendanceRows]);

  if (!profile) return null;

  if (!program || !insights) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Build a workout plan first to see consistency insights.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const adherencePct = Math.round(insights.adherenceRate * 100);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{adherencePct}%</Text>
            <Text style={styles.statLabel}>Adherence</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{insights.presentCount}</Text>
            <Text style={styles.statLabel}>Sessions done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, insights.missedCount > 0 && styles.statValueWarn]}>
              {insights.missedCount}
            </Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What this means for your goal</Text>
          <Text style={styles.cardBody}>
            Your program is planned for {program.durationWeeks} weeks toward{' '}
            <Text style={styles.highlight}>{profile.goal.replace(/_/g, ' ')}</Text>, based on hitting all{' '}
            {insights.scheduledSoFar > 0 ? 'your scheduled' : 'your'} sessions.
          </Text>
          {insights.missedCount > 0 ? (
            <Text style={styles.cardBody}>
              At your current pace ({adherencePct}% of scheduled sessions), you're on track to add roughly{' '}
              <Text style={styles.highlight}>{insights.projectedExtraDays} days</Text> to reach the same result —
              about <Text style={styles.highlight}>{insights.extraDaysPerMiss.toFixed(1)} days</Text> of delay for
              every session skipped.
            </Text>
          ) : (
            <Text style={styles.cardBody}>
              You haven't missed a scheduled session yet — keep this pace and you're on track for the original
              timeline.
            </Text>
          )}
          <Text style={styles.disclaimer}>
            This is a rough estimate based on your own program's pace, not a guarantee — real progress depends on a
            lot more than attendance alone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#9BA895',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0A0F0C80',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#B6FF3C',
  },
  statValueWarn: {
    color: '#F87171',
  },
  statLabel: {
    fontSize: 12,
    color: '#9BA895',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    backgroundColor: '#0A0F0C80',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  cardBody: {
    fontSize: 14,
    color: '#B9C4B2',
    lineHeight: 21,
  },
  highlight: {
    color: '#B6FF3C',
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: '#7C8A78',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

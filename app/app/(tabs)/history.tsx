import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { desc, eq } from 'drizzle-orm';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { workoutSession, workoutSetLog } from '../../src/db/schema';

export default function HistoryScreen() {
  const { data: sessions } = useLiveQuery(
    db.select().from(workoutSession).where(eq(workoutSession.status, 'completed')).orderBy(desc(workoutSession.completedAt)),
  );
  const { data: allSetLogs } = useLiveQuery(db.select().from(workoutSetLog));

  const completedCount = sessions?.length ?? 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeekCount =
    sessions?.filter((s) => (s.completedAt?.getTime() ?? 0) >= weekAgo).length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>History</Text>

        {completedCount > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Total workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{thisWeekCount}</Text>
              <Text style={styles.statLabel}>This week</Text>
            </View>
          </View>
        )}

        {completedCount === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Your logged workouts and progress will show up here once you complete one.
            </Text>
          </View>
        ) : (
          sessions!.map((session) => {
            const sets = (allSetLogs ?? []).filter((log) => log.sessionId === session.id);
            const exerciseCount = new Set(sets.map((s) => s.exerciseName)).size;
            return (
              <View key={session.id} style={styles.card}>
                <Text style={styles.cardTitle}>{session.focus}</Text>
                <Text style={styles.cardSubtitle}>
                  {session.completedAt?.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {exerciseCount} exercises · {sets.length} sets
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F0D',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#12181580',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8A8A8E',
    marginTop: 4,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    gap: 6,
    backgroundColor: '#12181580',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A8A8E',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A8A8E',
    lineHeight: 20,
  },
});

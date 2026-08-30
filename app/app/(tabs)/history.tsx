import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { desc, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { workoutSession, workoutSetLog, WorkoutSetLogRow } from '../../src/db/schema';

function groupSetsByExercise(sets: WorkoutSetLogRow[]) {
  const byExercise = new Map<string, { order: number; sets: WorkoutSetLogRow[] }>();
  for (const set of sets) {
    const existing = byExercise.get(set.exerciseName);
    if (existing) {
      existing.sets.push(set);
    } else {
      byExercise.set(set.exerciseName, { order: set.exerciseOrder, sets: [set] });
    }
  }
  return Array.from(byExercise.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .map(([name, { sets }]) => ({
      name,
      sets: sets.sort((a, b) => a.setNumber - b.setNumber),
    }));
}

export default function HistoryScreen() {
  const router = useRouter();
  const { data: sessions } = useLiveQuery(
    db.select().from(workoutSession).where(eq(workoutSession.status, 'completed')).orderBy(desc(workoutSession.completedAt)),
  );
  const { data: allSetLogs } = useLiveQuery(db.select().from(workoutSetLog));
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const completedCount = sessions?.length ?? 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeekCount =
    sessions?.filter((s) => (s.completedAt?.getTime() ?? 0) >= weekAgo).length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>History</Text>
          <Pressable onPress={() => router.push('/insights')}>
            <Text style={styles.insightsLink}>Insights ›</Text>
          </Pressable>
        </View>

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
            const exercises = groupSetsByExercise(sets);
            const isExpanded = expandedId === session.id;
            return (
              <Pressable
                key={session.id}
                style={styles.card}
                onPress={() => setExpandedId(isExpanded ? null : session.id)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{session.focus}</Text>
                    <Text style={styles.cardSubtitle}>
                      {session.completedAt?.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {exercises.length} exercises · {sets.length} sets
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? '︿' : '﹀'}</Text>
                </View>

                {isExpanded && (
                  <View style={styles.detail}>
                    {exercises.map((ex) => (
                      <View key={ex.name} style={styles.exerciseBlock}>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                        <View style={styles.setsRow}>
                          {ex.sets.map((set) => (
                            <View key={set.id} style={styles.setChip}>
                              <Text style={styles.setChipText}>
                                {set.reps}
                                {set.weightKg ? ` · ${set.weightKg}kg` : ''}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
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
    backgroundColor: '#05070A',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  insightsLink: {
    color: '#B6FF3C',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#B6FF3C',
  },
  statLabel: {
    fontSize: 12,
    color: '#7C8A78',
    marginTop: 4,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0A0F0C80',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
  chevron: {
    color: '#5C6658',
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7C8A78',
  },
  emptyText: {
    fontSize: 14,
    color: '#7C8A78',
    lineHeight: 20,
  },
  detail: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1C2318',
    gap: 12,
  },
  exerciseBlock: {
    gap: 6,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EAFFEF',
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setChip: {
    borderWidth: 1,
    borderColor: '#1C2318',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  setChipText: {
    color: '#7C8A78',
    fontSize: 12,
  },
});

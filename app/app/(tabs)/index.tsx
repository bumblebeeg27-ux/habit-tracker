import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { userProfile, workoutProgram as workoutProgramTable } from '../../src/db/schema';
import { getActiveWorkoutProgram, saveWorkoutProgram } from '../../src/db/repositories/workoutProgram';
import { startWorkoutSession } from '../../src/db/repositories/workoutSession';
import { fetchWorkoutProgram } from '../../src/services/api';
import { WorkoutProgram } from '../../src/types/workout';

export default function TodayScreen() {
  const router = useRouter();
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: programRows } = useLiveQuery(db.select().from(workoutProgramTable));
  const profile = profiles?.[0];
  const hasActiveProgram = (programRows?.length ?? 0) > 0;

  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasActiveProgram) {
      getActiveWorkoutProgram().then(setProgram);
    }
  }, [programRows]);

  async function handleStartDay(day: WorkoutProgram['days'][number]) {
    const sessionId = await startWorkoutSession(day);
    router.push(`/workout/${sessionId}?dayIndex=${day.dayIndex}`);
  }

  async function handleGenerate() {
    if (!profile || loading) return;
    setLoading(true);
    setError(null);
    try {
      const generated = await fetchWorkoutProgram(profile);
      await saveWorkoutProgram(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Today</Text>

        {!hasActiveProgram && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No workout plan yet</Text>
            <Text style={styles.cardSubtitle}>
              Your coach will build a {profile.daysPerWeek}-day/week program for {profile.goal.replace(/_/g, ' ')}.
            </Text>
            <Pressable style={styles.button} onPress={handleGenerate}>
              <Text style={styles.buttonText}>Build my plan</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <View style={styles.card}>
            <ActivityIndicator color="#22C55E" />
            <Text style={[styles.cardSubtitle, styles.loadingText]}>Building your program…</Text>
          </View>
        )}

        {error && (
          <View style={styles.card}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.button} onPress={handleGenerate}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {program && !loading && (
          <View style={styles.programSummary}>
            <Text style={styles.programSummaryText}>
              {program.daysPerWeek}x/week · {program.durationWeeks}-week program
            </Text>
          </View>
        )}

        {program?.days.map((day) => (
          <View key={day.dayIndex} style={styles.card}>
            <Text style={styles.cardTitle}>
              Day {day.dayIndex} · {day.focus}
            </Text>
            {day.exercises.map((exercise, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.sets} × {exercise.reps} · rest {exercise.restSec}s
                </Text>
                {exercise.notes ? <Text style={styles.exerciseNotes}>{exercise.notes}</Text> : null}
              </View>
            ))}
            <Pressable style={styles.button} onPress={() => handleStartDay(day)}>
              <Text style={styles.buttonText}>Start workout</Text>
            </Pressable>
          </View>
        ))}
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
  card: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    backgroundColor: '#12181580',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8A8A8E',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#04150B',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    lineHeight: 20,
  },
  programSummary: {
    paddingHorizontal: 4,
  },
  programSummaryText: {
    color: '#8A8A8E',
    fontSize: 13,
  },
  exerciseRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2A24',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  exerciseMeta: {
    color: '#8A8A8E',
    fontSize: 13,
    marginTop: 2,
  },
  exerciseNotes: {
    color: '#5B655F',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

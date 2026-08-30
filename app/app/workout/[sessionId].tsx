import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput } from '../../src/components/LabeledInput';
import { getActiveWorkoutProgram } from '../../src/db/repositories/workoutProgram';
import { completeWorkoutSession, logSet } from '../../src/db/repositories/workoutSession';
import { WorkoutDay } from '../../src/types/workout';

type Phase = 'loading' | 'logging' | 'resting' | 'complete';

export default function WorkoutSessionScreen() {
  const { sessionId, dayIndex } = useLocalSearchParams<{ sessionId: string; dayIndex: string }>();
  const router = useRouter();

  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [restRemaining, setRestRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getActiveWorkoutProgram().then((program) => {
      const found = program?.days.find((d) => d.dayIndex === Number(dayIndex));
      if (found) {
        setDay(found);
        setReps(found.exercises[0]?.reps ?? '');
        setPhase('logging');
      }
    });
  }, [dayIndex]);

  useEffect(() => {
    if (phase !== 'resting') return;
    timerRef.current = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          advance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'loading' || !day) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.subtitle}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const exercise = day.exercises[exerciseIndex];

  async function handleLogSet() {
    await logSet({
      sessionId: Number(sessionId),
      exerciseName: exercise.name,
      exerciseOrder: exerciseIndex,
      setNumber,
      reps: reps || exercise.reps,
      weightKg: weightKg ? Number(weightKg) : undefined,
    });

    const isLastSetOfExercise = setNumber >= exercise.sets;
    const isLastExercise = exerciseIndex >= day!.exercises.length - 1;

    if (isLastSetOfExercise && isLastExercise) {
      await completeWorkoutSession(Number(sessionId));
      setPhase('complete');
      return;
    }

    setRestRemaining(exercise.restSec);
    setPhase('resting');
  }

  function advance() {
    const isLastSetOfExercise = setNumber >= exercise.sets;
    if (isLastSetOfExercise) {
      const nextExercise = day!.exercises[exerciseIndex + 1];
      setExerciseIndex((i) => i + 1);
      setSetNumber(1);
      setReps(nextExercise?.reps ?? '');
    } else {
      setSetNumber((n) => n + 1);
    }
    setWeightKg('');
    setPhase('logging');
  }

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Workout complete 💪</Text>
          <Text style={styles.subtitle}>Nice work on {day.focus.toLowerCase()}.</Text>
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'resting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.subtitle}>Rest</Text>
          <Text style={styles.timer}>{restRemaining}s</Text>
          <Pressable
            style={styles.button}
            onPress={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              advance();
            }}
          >
            <Text style={styles.buttonText}>Skip rest</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.progress}>
          Exercise {exerciseIndex + 1} of {day.exercises.length}
        </Text>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.subtitle}>
          Set {setNumber} of {exercise.sets} · target {exercise.reps}
          {exercise.notes ? ` · ${exercise.notes}` : ''}
        </Text>

        <LabeledInput
          label="Reps completed"
          keyboardType="default"
          value={reps}
          onChangeText={setReps}
          containerStyle={{ marginTop: 24 }}
        />
        <LabeledInput
          label="Weight (kg, optional)"
          keyboardType="decimal-pad"
          value={weightKg}
          onChangeText={setWeightKg}
          containerStyle={{ marginTop: 16 }}
        />

        <Pressable style={[styles.button, { marginTop: 24 }]} onPress={handleLogSet}>
          <Text style={styles.buttonText}>Log set</Text>
        </Pressable>
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
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  progress: {
    color: '#7C8A78',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#EAFFEF',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C8A78',
    marginTop: 8,
  },
  timer: {
    fontSize: 64,
    fontWeight: '700',
    color: '#B6FF3C',
  },
  button: {
    backgroundColor: '#B6FF3C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0A1400',
    fontSize: 17,
    fontWeight: '700',
  },
});

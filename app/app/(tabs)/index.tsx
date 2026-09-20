import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddExerciseRow } from '../../src/components/AddExerciseRow';
import { DayPickerModal } from '../../src/components/DayPickerModal';
import { ExerciseRow } from '../../src/components/ExerciseRow';
import { db } from '../../src/db/client';
import { attendanceRecord, streakState, userProfile, workoutProgram as workoutProgramTable } from '../../src/db/schema';
import {
  addExercise,
  getActiveProgramRow,
  getActiveWorkoutProgram,
  getWeeklySchedule,
  removeExercise,
  saveWeeklySchedule,
  saveWorkoutProgram,
  updateExercise,
} from '../../src/db/repositories/workoutProgram';
import { startWorkoutSession } from '../../src/db/repositories/workoutSession';
import { backfillMissedAttendance, checkIn, todayDateString } from '../../src/db/repositories/attendance';
import { fetchWorkoutProgram } from '../../src/services/api';
import { setupNotifications, rescheduleStreakRiskNudge } from '../../src/services/notifications';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';
import { WeeklySchedule, WorkoutProgram } from '../../src/types/workout';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TodayScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: programRows } = useLiveQuery(db.select().from(workoutProgramTable));
  const { data: attendanceRows } = useLiveQuery(db.select().from(attendanceRecord));
  const { data: streakRows } = useLiveQuery(db.select().from(streakState));
  const profile = profiles?.[0];
  const hasActiveProgram = (programRows?.length ?? 0) > 0;
  const checkedInToday = (attendanceRows ?? []).some((row) => row.date === todayDateString());
  const streak = streakRows?.[0];

  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const todayWeekday = new Date().getDay();
  const [selectedWeekday, setSelectedWeekday] = useState(todayWeekday);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [pickerWeekday, setPickerWeekday] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasActiveProgram) {
      getActiveWorkoutProgram().then(setProgram);
      getWeeklySchedule().then((sched) => {
        setSchedule(sched);
        if (sched) {
          getActiveProgramRow().then((row) => {
            if (row) backfillMissedAttendance(sched, new Date(row.createdAt));
          });
        }
      });
    } else {
      setProgram(null);
      setSchedule(null);
    }
  }, [programRows]);

  useEffect(() => {
    if (profile) setupNotifications(profile, checkedInToday);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!profile, profile?.notificationsEnabled]);

  useEffect(() => {
    if (profile) rescheduleStreakRiskNudge(checkedInToday);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedInToday]);

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

  function handleRegeneratePress() {
    Alert.alert(
      'Build a new program?',
      'This replaces your current program, including any exercises you added or edited yourself.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Build new plan', style: 'destructive', onPress: handleGenerate },
      ],
    );
  }

  function handleWeekdayPress(weekday: number) {
    if (editingSchedule && schedule && program) {
      setPickerWeekday(weekday);
    } else {
      setSelectedWeekday(weekday);
    }
  }

  function handlePickDay(dayIndex: number | null) {
    if (pickerWeekday === null || !schedule) return;
    const updated = { ...schedule, [pickerWeekday]: dayIndex };
    setSchedule(updated);
    saveWeeklySchedule(updated);
  }

  if (!profile) return null;

  const selectedDayIndex = schedule?.[selectedWeekday] ?? null;
  const selectedDay = program?.days.find((d) => d.dayIndex === selectedDayIndex) ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Today</Text>

        <View style={styles.streakCard}>
          <Pressable style={styles.streakInfo} onPress={() => router.push('/attendance-calendar')}>
            <Text style={styles.streakValue}>🔥 {streak?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>
              day streak · best {streak?.longestStreak ?? 0}
            </Text>
            <Text style={styles.calendarLink}>View calendar ›</Text>
          </Pressable>
          {checkedInToday ? (
            <View style={styles.checkedInBadge}>
              <Text style={styles.checkedInBadgeText}>Checked in ✓</Text>
            </View>
          ) : (
            <Pressable style={styles.checkInButton} onPress={() => checkIn()}>
              <Text style={styles.checkInButtonText}>Check in</Text>
            </Pressable>
          )}
        </View>

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
            <ActivityIndicator color={colors.accentText} />
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
          <>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>
                {program.daysPerWeek}x/week · {program.durationWeeks}-week program
              </Text>
              <View style={styles.headerActions}>
                <Pressable onPress={handleRegeneratePress}>
                  <Text style={styles.editScheduleLink}>Regenerate</Text>
                </Pressable>
                <Pressable onPress={() => setEditingSchedule((e) => !e)}>
                  <Text style={styles.editScheduleLink}>{editingSchedule ? 'Done' : 'Edit schedule'}</Text>
                </Pressable>
              </View>
            </View>
            {editingSchedule && (
              <Text style={styles.editScheduleHint}>Tap a day to choose which workout runs on it.</Text>
            )}
            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((label, w) => {
                const dayIndex = schedule?.[w];
                const isToday = w === todayWeekday;
                const isSelected = w === selectedWeekday;
                return (
                  <Pressable
                    key={w}
                    style={[
                      styles.weekdayChip,
                      isSelected && styles.weekdayChipSelected,
                      isToday && styles.weekdayChipToday,
                      editingSchedule && styles.weekdayChipEditing,
                    ]}
                    onPress={() => handleWeekdayPress(w)}
                  >
                    <Text style={styles.weekdayLabel}>{label}</Text>
                    <Text style={styles.weekdayValue}>{dayIndex ? `D${dayIndex}` : 'Rest'}</Text>
                    {editingSchedule && <Text style={styles.weekdayEditIcon}>✎</Text>}
                  </Pressable>
                );
              })}
            </View>

            {selectedDay ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Day {selectedDay.dayIndex} · {selectedDay.focus}
                </Text>
                {selectedDay.exercises.map((exercise, i) => (
                  <ExerciseRow
                    key={i}
                    exercise={exercise}
                    onSave={(patch) => updateExercise(selectedDay.dayIndex, i, patch)}
                    onDelete={() => removeExercise(selectedDay.dayIndex, i)}
                  />
                ))}
                <AddExerciseRow onAdd={(exercise) => addExercise(selectedDay.dayIndex, exercise)} />
                <Pressable
                  style={[styles.button, selectedDay.exercises.length === 0 && styles.buttonDisabled]}
                  disabled={selectedDay.exercises.length === 0}
                  onPress={() => handleStartDay(selectedDay)}
                >
                  <Text style={styles.buttonText}>Start workout</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Rest day 😌</Text>
                <Text style={styles.cardSubtitle}>
                  Recovery is part of the plan. Light stretching, a walk, or just taking it easy is great here.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {program && pickerWeekday !== null && (
        <DayPickerModal
          visible
          weekday={pickerWeekday}
          program={program}
          currentDayIndex={schedule?.[pickerWeekday] ?? null}
          onSelect={handlePickDay}
          onClose={() => setPickerWeekday(null)}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    streakCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      backgroundColor: colors.card,
    },
    streakInfo: {
      flexShrink: 1,
    },
    streakValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    streakLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    calendarLink: {
      fontSize: 12,
      color: colors.accentText,
      marginTop: 6,
      fontWeight: '600',
    },
    checkInButton: {
      backgroundColor: colors.accentFill,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 18,
    },
    checkInButtonText: {
      color: colors.onAccent,
      fontSize: 14,
      fontWeight: '700',
    },
    checkedInBadge: {
      borderWidth: 1.5,
      borderColor: colors.accentText,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    checkedInBadgeText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '600',
    },
    card: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 8,
      backgroundColor: colors.card,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    loadingText: {
      textAlign: 'center',
    },
    button: {
      backgroundColor: colors.accentFill,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: colors.onAccent,
      fontSize: 15,
      fontWeight: '700',
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      lineHeight: 20,
    },
    weekHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 16,
    },
    weekTitle: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    editScheduleLink: {
      color: colors.accentText,
      fontSize: 13,
      fontWeight: '600',
    },
    editScheduleHint: {
      color: colors.textMuted,
      fontSize: 12,
      paddingHorizontal: 4,
      marginTop: -8,
    },
    weekdayRow: {
      flexDirection: 'row',
      gap: 6,
    },
    weekdayChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    weekdayChipSelected: {
      backgroundColor: colors.accentBg,
      borderColor: colors.accentText,
    },
    weekdayChipToday: {
      borderColor: colors.accentText,
    },
    weekdayChipEditing: {
      borderStyle: 'dashed',
    },
    weekdayLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    weekdayValue: {
      color: colors.textPrimary,
      fontSize: 11,
      marginTop: 4,
    },
    weekdayEditIcon: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 3,
    },
  });
}

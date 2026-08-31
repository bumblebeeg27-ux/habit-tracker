import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../src/db/client';
import { attendanceRecord, streakState } from '../src/db/schema';
import { AttendanceStatus, setAttendanceStatus, toLocalDateString } from '../src/db/repositories/attendance';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// unmarked -> present -> absent -> unmarked
function nextStatus(current: AttendanceStatus | undefined): AttendanceStatus | null {
  if (current === undefined) return 'present';
  if (current === 'present') return 'absent';
  return null;
}

export default function AttendanceCalendarScreen() {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { data: records } = useLiveQuery(db.select().from(attendanceRecord));
  const { data: streakRows } = useLiveQuery(db.select().from(streakState));
  const streak = streakRows?.[0];

  const statusByDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const row of records ?? []) map.set(row.date, row.status as AttendanceStatus);
    return map;
  }, [records]);

  const todayStr = toLocalDateString(new Date());
  const grid = useMemo(
    () => getMonthGrid(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor],
  );

  function handleDayPress(date: Date) {
    const dateStr = toLocalDateString(date);
    if (dateStr > todayStr) return; // no marking the future
    const next = nextStatus(statusByDate.get(dateStr));
    setAttendanceStatus(dateStr, next);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.streakCard}>
          <View>
            <Text style={styles.streakValue}>🔥 {streak?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>day streak · best {streak?.longestStreak ?? 0}</Text>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <Text style={styles.legendTick}>✓</Text>
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendCross}>✕</Text>
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthNav}>
          <Pressable
            style={styles.navButton}
            onPress={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
          </Text>
          <Pressable
            style={styles.navButton}
            onPress={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          >
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <Text key={i} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((date, i) => {
            if (!date) return <View key={i} style={styles.dayCell} />;
            const dateStr = toLocalDateString(date);
            const status = statusByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return (
              <Pressable
                key={i}
                style={[
                  styles.dayCell,
                  status === 'present' && styles.dayCellPresent,
                  status === 'absent' && styles.dayCellAbsent,
                  isToday && styles.dayCellToday,
                ]}
                onPress={() => handleDayPress(date)}
                disabled={isFuture}
              >
                <Text style={[styles.dayNumber, isFuture && styles.dayNumberFuture]}>{date.getDate()}</Text>
                {status === 'present' && <Text style={styles.dayMarkPresent}>✓</Text>}
                {status === 'absent' && <Text style={styles.dayMarkAbsent}>✕</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.hint}>Tap a day to cycle: unmarked → present → absent.</Text>
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
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0A0F0C80',
  },
  streakValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  streakLabel: {
    fontSize: 13,
    color: '#9BA895',
    marginTop: 2,
  },
  legend: {
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendTick: {
    color: '#B6FF3C',
    fontWeight: '700',
  },
  legendCross: {
    color: '#F87171',
    fontWeight: '700',
  },
  legendText: {
    color: '#9BA895',
    fontSize: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1C2318',
  },
  navButtonText: {
    color: '#EAFFEF',
    fontSize: 20,
  },
  monthLabel: {
    color: '#EAFFEF',
    fontSize: 18,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#7C8A78',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#B6FF3C',
  },
  dayCellPresent: {
    backgroundColor: '#1A2A0F',
  },
  dayCellAbsent: {
    backgroundColor: '#3A1414',
  },
  dayNumber: {
    color: '#EAFFEF',
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberFuture: {
    color: '#2A3324',
  },
  dayMarkPresent: {
    color: '#B6FF3C',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  dayMarkAbsent: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  hint: {
    color: '#7C8A78',
    fontSize: 12,
    textAlign: 'center',
  },
});

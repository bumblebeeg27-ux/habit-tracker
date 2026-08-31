import { StyleSheet, Text, View } from 'react-native';
import { WeeklyBreakdown } from '../services/insights';

const BAR_MAX_HEIGHT = 100;
const MIN_BAR_HEIGHT = 4;

export function ConsistencyChart({ weeks }: { weeks: WeeklyBreakdown[] }) {
  if (weeks.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weekly consistency</Text>
        <Legend />
      </View>
      <View style={styles.chartRow}>
        {weeks.map((week) => {
          const missed = Math.max(0, week.scheduled - week.present);
          const presentHeight =
            week.scheduled > 0 ? Math.max(week.present > 0 ? MIN_BAR_HEIGHT : 0, (week.present / week.scheduled) * BAR_MAX_HEIGHT) : 0;
          const missedHeight =
            week.scheduled > 0 ? Math.max(missed > 0 ? MIN_BAR_HEIGHT : 0, (missed / week.scheduled) * BAR_MAX_HEIGHT) : MIN_BAR_HEIGHT;

          return (
            <View key={week.weekIndex} style={styles.barColumn}>
              <Text style={styles.barCount}>
                {week.present}/{week.scheduled}
              </Text>
              <View style={styles.barTrack}>
                {missedHeight > 0 && <View style={[styles.barSegment, styles.barMissed, { height: missedHeight }]} />}
                {presentHeight > 0 && <View style={[styles.barSegment, styles.barPresent, { height: presentHeight }]} />}
              </View>
              <Text style={styles.barLabel}>W{week.weekIndex}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Legend() {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#B6FF3C' }]} />
        <Text style={styles.legendText}>Hit</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
        <Text style={styles.legendText}>Missed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    backgroundColor: '#0A0F0C80',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#9BA895',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 44,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barCount: {
    fontSize: 10,
    color: '#7C8A78',
  },
  barTrack: {
    width: 18,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  barSegment: {
    width: '100%',
  },
  barPresent: {
    backgroundColor: '#B6FF3C',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  barMissed: {
    backgroundColor: '#F87171',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barLabel: {
    fontSize: 11,
    color: '#9BA895',
    fontWeight: '600',
  },
});

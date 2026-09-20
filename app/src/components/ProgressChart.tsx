import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

export type ProgressPoint = {
  sessionId: number;
  date: Date;
  weightKg: number;
};

const BAR_MAX_HEIGHT = 90;
const MIN_BAR_HEIGHT = 4;

export function ProgressChart({ exerciseName, points }: { exerciseName: string; points: ProgressPoint[] }) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  if (points.length < 2) return null;

  const maxWeight = Math.max(...points.map((p) => p.weightKg));
  const minWeight = Math.min(...points.map((p) => p.weightKg));
  const range = maxWeight - minWeight;
  const first = points[0].weightKg;
  const last = points[points.length - 1].weightKg;
  const delta = last - first;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Progress · {exerciseName}</Text>
          <Text style={styles.subtitle}>Heaviest set per session</Text>
        </View>
        {delta !== 0 && (
          <Text style={[styles.delta, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}kg
          </Text>
        )}
      </View>
      <View style={styles.chartRow}>
        {points.map((point, i) => {
          const height =
            range === 0 ? BAR_MAX_HEIGHT * 0.6 : MIN_BAR_HEIGHT + ((point.weightKg - minWeight) / range) * (BAR_MAX_HEIGHT - MIN_BAR_HEIGHT);
          const isLast = i === points.length - 1;
          return (
            <View key={point.sessionId} style={styles.barColumn}>
              <Text style={styles.barValue}>{point.weightKg}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height }, isLast && styles.barLatest]} />
              </View>
              <Text style={styles.barLabel}>
                {point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 14,
      backgroundColor: colors.card,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    delta: {
      fontSize: 13,
      fontWeight: '700',
    },
    deltaUp: {
      color: colors.accentText,
    },
    deltaDown: {
      color: colors.danger,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: BAR_MAX_HEIGHT + 40,
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    barValue: {
      fontSize: 10,
      color: colors.textMuted,
    },
    barTrack: {
      width: 14,
      height: BAR_MAX_HEIGHT,
      justifyContent: 'flex-end',
    },
    bar: {
      width: '100%',
      borderRadius: 4,
      backgroundColor: colors.accentLight,
    },
    barLatest: {
      backgroundColor: colors.accentFill,
    },
    barLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
  });
}

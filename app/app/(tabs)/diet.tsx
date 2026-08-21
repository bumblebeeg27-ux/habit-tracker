import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { userProfile, dietPlan as dietPlanTable } from '../../src/db/schema';
import { getActiveDietPlan, saveDietPlan } from '../../src/db/repositories/dietPlan';
import { fetchDietPlan } from '../../src/services/api';
import { DietPlan } from '../../src/types/diet';

export default function DietScreen() {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: planRows } = useLiveQuery(db.select().from(dietPlanTable));
  const profile = profiles?.[0];
  const hasActivePlan = (planRows?.length ?? 0) > 0;

  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasActivePlan) {
      getActiveDietPlan().then(setPlan);
    }
  }, [planRows]);

  async function handleGenerate() {
    if (!profile || loading) return;
    setLoading(true);
    setError(null);
    try {
      const generated = await fetchDietPlan(profile);
      await saveDietPlan(generated);
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
        <Text style={styles.title}>Diet</Text>

        {!hasActivePlan && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No meal plan yet</Text>
            <Text style={styles.cardSubtitle}>
              Your coach will build a {profile.dietaryPreference.replace(/_/g, ' ')} plan for {profile.goal.replace(/_/g, ' ')}.
            </Text>
            <Pressable style={styles.button} onPress={handleGenerate}>
              <Text style={styles.buttonText}>Build my plan</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <View style={styles.card}>
            <ActivityIndicator color="#22C55E" />
            <Text style={[styles.cardSubtitle, styles.loadingText]}>Building your plan…</Text>
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

        {plan && !loading && (
          <>
            <View style={styles.macroCard}>
              <View style={styles.macroRow}>
                <MacroStat label="Calories" value={`${plan.dailyCalories}`} />
                <MacroStat label="Protein" value={`${plan.proteinG}g`} />
                <MacroStat label="Carbs" value={`${plan.carbsG}g`} />
                <MacroStat label="Fat" value={`${plan.fatG}g`} />
              </View>
              <Pressable style={styles.regenerateButton} onPress={handleGenerate}>
                <Text style={styles.regenerateButtonText}>Regenerate plan</Text>
              </Pressable>
            </View>

            {plan.meals.map((meal, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.mealHeader}>
                  <Text style={styles.cardTitle}>{meal.name}</Text>
                  <Text style={styles.mealCalories}>{meal.approxCalories} kcal</Text>
                </View>
                {meal.items.map((item, j) => (
                  <Text key={j} style={styles.mealItem}>
                    · {item}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroStat}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
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
  macroCard: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#12181580',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroStat: {
    alignItems: 'center',
  },
  macroValue: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#8A8A8E',
    fontSize: 12,
    marginTop: 2,
  },
  regenerateButton: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: '#8A8A8E',
    fontSize: 14,
    fontWeight: '600',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCalories: {
    color: '#8A8A8E',
    fontSize: 13,
  },
  mealItem: {
    color: '#C7CCC9',
    fontSize: 14,
    lineHeight: 20,
  },
});

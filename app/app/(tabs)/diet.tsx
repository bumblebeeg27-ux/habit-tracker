import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { userProfile, dietPlan as dietPlanTable } from '../../src/db/schema';
import {
  addFoodItem,
  addMeal,
  getActiveDietPlan,
  removeFoodItem,
  removeMeal,
  saveDietPlan,
} from '../../src/db/repositories/dietPlan';
import { fetchDietPlan } from '../../src/services/api';
import { DietPlan, Meal } from '../../src/types/diet';

const MEAL_ICONS: { match: RegExp; icon: string }[] = [
  { match: /breakfast/i, icon: '🍳' },
  { match: /lunch/i, icon: '🥗' },
  { match: /dinner/i, icon: '🍽️' },
  { match: /snack/i, icon: '🍎' },
  { match: /shake|smoothie|protein/i, icon: '🥤' },
];

function iconForMeal(name: string): string {
  return MEAL_ICONS.find((m) => m.match.test(name))?.icon ?? '🍴';
}

export default function DietScreen() {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: planRows } = useLiveQuery(db.select().from(dietPlanTable));
  const profile = profiles?.[0];
  const hasActivePlan = (planRows?.length ?? 0) > 0;

  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingMeal, setAddingMeal] = useState(false);

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

  function handleRegeneratePress() {
    Alert.alert(
      'Build a new plan?',
      'This replaces your current plan, including any meals you added or edited yourself.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Build new plan', style: 'destructive', onPress: handleGenerate },
      ],
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Diet</Text>

        {!hasActivePlan && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No meal plan yet</Text>
            <Text style={styles.cardSubtitle}>
              Your coach will build
              {profile.dietaryPreference === 'none' ? ' a' : ` a ${profile.dietaryPreference.replace(/_/g, ' ')}`} plan for{' '}
              {profile.goal.replace(/_/g, ' ')}.
            </Text>
            <Pressable style={styles.button} onPress={handleGenerate}>
              <Text style={styles.buttonText}>Build my plan</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <View style={styles.card}>
            <ActivityIndicator color="#B6FF3C" />
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
              <Pressable style={styles.regenerateButton} onPress={handleRegeneratePress}>
                <Text style={styles.regenerateButtonText}>Regenerate plan</Text>
              </Pressable>
            </View>

            {plan.meals.map((meal, i) => (
              <MealCard key={i} meal={meal} mealIndex={i} />
            ))}

            {addingMeal ? (
              <AddMealForm onDone={() => setAddingMeal(false)} />
            ) : (
              <Pressable style={styles.addMealButton} onPress={() => setAddingMeal(true)}>
                <Text style={styles.addMealButtonText}>+ Add your own meal</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MealCard({ meal, mealIndex }: { meal: Meal; mealIndex: number }) {
  const [addingItem, setAddingItem] = useState(false);
  const [itemText, setItemText] = useState('');

  function handleRemoveMeal() {
    Alert.alert('Remove meal?', `This removes ${meal.name} from your plan.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMeal(mealIndex) },
    ]);
  }

  function handleAddItem() {
    if (!itemText.trim()) return;
    addFoodItem(mealIndex, itemText.trim());
    setItemText('');
    setAddingItem(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.mealHeader}>
        <Text style={styles.cardTitle}>
          {iconForMeal(meal.name)} {meal.name}
        </Text>
        <View style={styles.mealHeaderRight}>
          <Text style={styles.mealCalories}>{meal.approxCalories} kcal</Text>
          <Pressable style={styles.mealDeleteButton} onPress={handleRemoveMeal}>
            <Text style={styles.mealDeleteIcon}>✕</Text>
          </Pressable>
        </View>
      </View>
      {meal.items.map((item, j) => (
        <View key={j} style={styles.mealItemRow}>
          <Text style={styles.mealItem}>· {item}</Text>
          <Pressable onPress={() => removeFoodItem(mealIndex, j)}>
            <Text style={styles.mealItemDelete}>✕</Text>
          </Pressable>
        </View>
      ))}

      {addingItem ? (
        <View style={styles.addItemRow}>
          <TextInput
            style={styles.addItemInput}
            value={itemText}
            onChangeText={setItemText}
            placeholder="e.g. 1 cup Greek yogurt"
            placeholderTextColor="#7C8A78"
            autoFocus
            onSubmitEditing={handleAddItem}
          />
          <Pressable style={styles.addItemConfirm} onPress={handleAddItem}>
            <Text style={styles.addItemConfirmText}>Add</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addItemLink} onPress={() => setAddingItem(true)}>
          <Text style={styles.addItemLinkText}>+ Add food item</Text>
        </Pressable>
      )}
    </View>
  );
}

function AddMealForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    addMeal({ name: name.trim(), items: [], approxCalories: Number(calories) || 0 });
    onDone();
  }

  return (
    <View style={styles.addMealForm}>
      <TextInput
        style={styles.addMealNameInput}
        value={name}
        onChangeText={setName}
        placeholder="Meal name, e.g. Evening Snack"
        placeholderTextColor="#7C8A78"
        autoFocus
      />
      <TextInput
        style={styles.addMealNameInput}
        value={calories}
        onChangeText={setCalories}
        placeholder="Approx calories (optional)"
        placeholderTextColor="#7C8A78"
        keyboardType="number-pad"
      />
      <View style={styles.addMealActions}>
        <Pressable style={styles.cancelButton} onPress={onDone}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.confirmButton, !name.trim() && styles.confirmButtonDisabled]} onPress={handleAdd}>
          <Text style={styles.confirmButtonText}>Add meal</Text>
        </Pressable>
      </View>
    </View>
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
    backgroundColor: '#05070A',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    backgroundColor: '#0A0F0C80',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9BA895',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#B6FF3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#0A1400',
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
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0A0F0C80',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroStat: {
    alignItems: 'center',
  },
  macroValue: {
    color: '#B6FF3C',
    fontSize: 20,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#9BA895',
    fontSize: 12,
    marginTop: 2,
  },
  regenerateButton: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#B6FF3C',
    backgroundColor: '#1A2A0F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: '#CFFF7A',
    fontSize: 14,
    fontWeight: '700',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealCalories: {
    color: '#9BA895',
    fontSize: 13,
  },
  mealDeleteButton: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1C2318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDeleteIcon: {
    color: '#F87171',
    fontSize: 11,
  },
  mealItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealItem: {
    color: '#B9C4B2',
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  mealItemDelete: {
    color: '#7C8A78',
    fontSize: 12,
    paddingHorizontal: 6,
  },
  addItemLink: {
    marginTop: 4,
  },
  addItemLinkText: {
    color: '#B6FF3C',
    fontSize: 13,
    fontWeight: '600',
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#EAFFEF',
    fontSize: 13,
    backgroundColor: '#05070A',
  },
  addItemConfirm: {
    backgroundColor: '#B6FF3C',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addItemConfirmText: {
    color: '#0A1400',
    fontSize: 13,
    fontWeight: '700',
  },
  addMealButton: {
    borderWidth: 1.5,
    borderColor: '#B6FF3C',
    backgroundColor: '#1A2A0F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addMealButtonText: {
    color: '#CFFF7A',
    fontSize: 15,
    fontWeight: '700',
  },
  addMealForm: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    backgroundColor: '#0A0F0C80',
  },
  addMealNameInput: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#EAFFEF',
    fontSize: 14,
    backgroundColor: '#05070A',
  },
  addMealActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9BA895',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#B6FF3C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#0A1400',
    fontSize: 14,
    fontWeight: '700',
  },
});

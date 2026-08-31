import { eq } from 'drizzle-orm';
import { db } from '../client';
import { dietPlan } from '../schema';
import { DietPlan, Meal } from '../../types/diet';

async function getActivePlanRow() {
  const rows = await db.select().from(dietPlan).where(eq(dietPlan.isActive, true));
  return rows[0] ?? null;
}

async function updateActivePlan(mutate: (plan: DietPlan) => void): Promise<void> {
  const row = await getActivePlanRow();
  if (!row) return;
  const plan = JSON.parse(row.planJson) as DietPlan;
  mutate(plan);
  await db.update(dietPlan).set({ planJson: JSON.stringify(plan) }).where(eq(dietPlan.id, row.id));
}

export async function getActiveDietPlan(): Promise<DietPlan | null> {
  const rows = await db.select().from(dietPlan).where(eq(dietPlan.isActive, true));
  const row = rows[0];
  if (!row) return null;
  return JSON.parse(row.planJson) as DietPlan;
}

export async function saveDietPlan(plan: DietPlan): Promise<void> {
  await db.update(dietPlan).set({ isActive: false }).where(eq(dietPlan.isActive, true));
  await db.insert(dietPlan).values({
    dailyCalories: plan.dailyCalories,
    proteinG: plan.proteinG,
    carbsG: plan.carbsG,
    fatG: plan.fatG,
    planJson: JSON.stringify(plan),
    isActive: true,
    createdAt: new Date(),
  });
}

export async function addMeal(meal: Meal): Promise<void> {
  await updateActivePlan((plan) => {
    plan.meals.push(meal);
  });
}

export async function removeMeal(mealIndex: number): Promise<void> {
  await updateActivePlan((plan) => {
    plan.meals.splice(mealIndex, 1);
  });
}

export async function addFoodItem(mealIndex: number, item: string): Promise<void> {
  await updateActivePlan((plan) => {
    plan.meals[mealIndex]?.items.push(item);
  });
}

export async function removeFoodItem(mealIndex: number, itemIndex: number): Promise<void> {
  await updateActivePlan((plan) => {
    plan.meals[mealIndex]?.items.splice(itemIndex, 1);
  });
}

import { eq } from 'drizzle-orm';
import { db } from '../client';
import { dietPlan } from '../schema';
import { DietPlan } from '../../types/diet';

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

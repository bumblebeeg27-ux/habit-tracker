export type Meal = {
  name: string;
  items: string[];
  approxCalories: number;
};

export type DietPlan = {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  meals: Meal[];
};

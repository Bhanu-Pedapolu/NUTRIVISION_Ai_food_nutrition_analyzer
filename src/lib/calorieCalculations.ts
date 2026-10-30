/**
 * Calorie & Nutrition Calculation Utilities
 * 
 * All formulas for BMR, TDEE, macro splits, BMI, and goal-based planning.
 * Uses Mifflin-St Jeor equation for BMR calculation.
 */

export type Goal = "loss" | "gain" | "maintain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type DietPreference = "veg" | "non-veg" | "none";

export interface UserInputs {
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeightKg?: number;
  timeframeWeeks?: number;
  dietPreference?: DietPreference;
}

export interface CalorieResults {
  // Basic metrics
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: string;
  
  // Goal-based calorie targets
  dailyCalories: number;
  calorieDeficitSurplus: number;
  
  // Macros (grams per day)
  protein: number;
  fat: number;
  carbs: number;
  
  // Additional metrics
  waterIntakeMl: number;
  waterIntakeLiters: number;
  
  // Weight change projections
  weeklyWeightChangeKg: number;
  estimatedWeeksToGoal: number | null;
  isSafeRate: boolean;
  
  // Activity recommendations
  dailyCaloriesToBurn: number;
  activities: ActivityRecommendation[];
  
  // Safety constraints
  minCalories: number;
  maxCalories: number;
  isCalorieClamped: boolean;
}

export interface ActivityRecommendation {
  name: string;
  caloriesPerHour: number; // Base rate for 70kg person
  durationMinutes: number;
  totalCalories: number;
}

/**
 * Activity multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // little or no exercise
  light: 1.375,        // 1-3 days/week
  moderate: 1.55,      // 3-5 days/week
  active: 1.725,       // 6-7 days/week
  very_active: 1.9,    // intense daily exercise / athlete
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + s
 * where s = +5 for males, -161 for females
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "male" | "female"
): number {
  const sexOffset = sex === "male" ? 5 : -161;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset);
}

/**
 * Calculate Total Daily Energy Expenditure
 * TDEE = BMR × activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate Body Mass Index
 * BMI = weight(kg) / (height(m))²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/**
 * Calculate daily calorie target based on goal
 * Weight loss: TDEE - 300 to 500 (safe: 0.25-0.75 kg/week)
 * Weight gain: TDEE + 300 to 500 (safe: 0.25-0.5 kg/week)
 * Maintenance: TDEE
 */
export function calculateDailyCalories(
  tdee: number,
  goal: Goal,
  sex: "male" | "female",
  targetWeightKg?: number,
  currentWeightKg?: number,
  timeframeWeeks?: number
): { calories: number; deficit: number; clamped: boolean } {
  const minCalories = sex === "male" ? 1500 : 1200;
  const maxCalories = tdee + 1000; // Safety ceiling for gain
  
  let targetCalories = tdee;
  let deficit = 0;
  
  if (goal === "maintain") {
    targetCalories = tdee;
  } else if (goal === "loss") {
    // Default deficit: 400 kcal/day (moderate pace)
    deficit = -400;
    
    // Adjust based on timeframe if provided
    if (targetWeightKg && currentWeightKg && timeframeWeeks) {
      const totalWeightLoss = currentWeightKg - targetWeightKg;
      const weeklyLoss = totalWeightLoss / timeframeWeeks;
      // 1 kg fat ≈ 7700 kcal, so daily deficit = (weeklyLoss × 7700) / 7
      const calculatedDeficit = Math.round((weeklyLoss * 7700) / 7);
      deficit = -Math.min(Math.max(calculatedDeficit, 300), 1000);
    }
    
    targetCalories = tdee + deficit;
  } else if (goal === "gain") {
    // Default surplus: 400 kcal/day (moderate pace)
    deficit = 400;
    
    // Adjust based on timeframe if provided
    if (targetWeightKg && currentWeightKg && timeframeWeeks) {
      const totalWeightGain = targetWeightKg - currentWeightKg;
      const weeklyGain = totalWeightGain / timeframeWeeks;
      // 1 kg ≈ 7700 kcal for muscle/fat gain
      const calculatedSurplus = Math.round((weeklyGain * 7700) / 7);
      deficit = Math.min(Math.max(calculatedSurplus, 300), 1000);
    }
    
    targetCalories = tdee + deficit;
  }
  
  // Apply safety constraints
  const clamped = targetCalories < minCalories || targetCalories > maxCalories;
  const clampedCalories = Math.max(minCalories, Math.min(maxCalories, targetCalories));
  
  return {
    calories: Math.round(clampedCalories),
    deficit: deficit,
    clamped,
  };
}

/**
 * Calculate protein target (grams per day)
 * Loss: 1.6-2.2 g/kg (preserve muscle during deficit)
 * Gain: 1.6-2.0 g/kg (support muscle growth)
 * Maintain: 1.2-1.6 g/kg (general health)
 */
export function calculateProtein(weightKg: number, goal: Goal): number {
  let proteinPerKg: number;
  
  switch (goal) {
    case "loss":
      proteinPerKg = 2.0; // Higher to preserve muscle
      break;
    case "gain":
      proteinPerKg = 1.8; // Support muscle growth
      break;
    case "maintain":
      proteinPerKg = 1.4; // General health
      break;
  }
  
  return Math.round(weightKg * proteinPerKg);
}

/**
 * Calculate macronutrient split
 * Fat: 20-30% of calories (using 25%)
 * Protein: calculated separately
 * Carbs: remaining calories
 */
export function calculateMacros(
  dailyCalories: number,
  proteinGrams: number
): { protein: number; fat: number; carbs: number } {
  // Protein: 4 kcal/g, Fat: 9 kcal/g, Carbs: 4 kcal/g
  const proteinCalories = proteinGrams * 4;
  const fatCalories = Math.round(dailyCalories * 0.25); // 25% from fat
  const carbCalories = dailyCalories - proteinCalories - fatCalories;
  
  return {
    protein: proteinGrams,
    fat: Math.round(fatCalories / 9),
    carbs: Math.max(0, Math.round(carbCalories / 4)),
  };
}

/**
 * Calculate daily water intake
 * Formula: ~35 ml per kg body weight
 */
export function calculateWaterIntake(weightKg: number): {
  ml: number;
  liters: number;
} {
  const ml = Math.round(weightKg * 35);
  return {
    ml,
    liters: Math.round((ml / 1000) * 10) / 10,
  };
}

/**
 * Calculate weekly weight change rate and safety
 * Safe loss: 0.25-0.75 kg/week
 * Safe gain: 0.25-0.5 kg/week
 */
export function calculateWeightChangeRate(
  calorieDeficitSurplus: number,
  goal: Goal
): { weeklyKg: number; isSafe: boolean } {
  // 7700 kcal ≈ 1 kg of body weight change
  const weeklyKg = (calorieDeficitSurplus * 7) / 7700;
  
  let isSafe = true;
  if (goal === "loss") {
    // Safe range: -0.25 to -0.75 kg/week
    isSafe = Math.abs(weeklyKg) >= 0.25 && Math.abs(weeklyKg) <= 0.75;
  } else if (goal === "gain") {
    // Safe range: 0.25 to 0.5 kg/week
    isSafe = weeklyKg >= 0.25 && weeklyKg <= 0.5;
  }
  
  return {
    weeklyKg: Math.round(weeklyKg * 100) / 100,
    isSafe,
  };
}

/**
 * Estimate weeks to reach target weight
 */
export function estimateTimeToGoal(
  currentWeightKg: number,
  targetWeightKg: number | undefined,
  weeklyChangeKg: number
): number | null {
  if (!targetWeightKg || weeklyChangeKg === 0) return null;
  
  const totalChange = Math.abs(targetWeightKg - currentWeightKg);
  return Math.ceil(totalChange / Math.abs(weeklyChangeKg));
}

/**
 * Calculate recommended daily calories to burn through exercise
 * For weight loss: 200-400 kcal/day extra helps accelerate progress
 * For gain: minimal cardio, focus on strength
 * For maintain: 150-300 kcal/day for general health
 */
export function calculateCaloriesToBurn(goal: Goal): number {
  switch (goal) {
    case "loss":
      return 300; // Moderate cardio recommendation
    case "gain":
      return 100; // Light activity only
    case "maintain":
      return 200; // General fitness
  }
}

/**
 * Get activity recommendations with adjusted durations based on body weight
 * Base rates are for a 70kg person; scaled by weight
 */
export function getActivityRecommendations(
  targetCalories: number,
  weightKg: number
): ActivityRecommendation[] {
  const weightFactor = weightKg / 70;
  
  // Base calories per hour for 70kg person
  const activities = [
    { name: "Walking (moderate pace)", baseRate: 280 },
    { name: "Jogging / Light running", baseRate: 490 },
    { name: "Cycling (moderate)", baseRate: 420 },
    { name: "Swimming", baseRate: 560 },
    { name: "Jump rope", baseRate: 700 },
    { name: "Dancing / Zumba", baseRate: 400 },
    { name: "Weight training", baseRate: 350 },
  ];
  
  return activities.map((activity) => {
    const adjustedRate = Math.round(activity.baseRate * weightFactor);
    const durationMinutes = Math.round((targetCalories / adjustedRate) * 60);
    
    return {
      name: activity.name,
      caloriesPerHour: adjustedRate,
      durationMinutes,
      totalCalories: targetCalories,
    };
  });
}

/**
 * Main calculation function - orchestrates all calculations
 */
export function calculateAllMetrics(inputs: UserInputs): CalorieResults {
  // Validate and clamp inputs
  const age = Math.min(80, Math.max(15, inputs.age));
  const heightCm = Math.min(250, Math.max(90, inputs.heightCm));
  const weightKg = Math.min(300, Math.max(30, inputs.weightKg));
  
  // Basic calculations
  const bmr = calculateBMR(weightKg, heightCm, age, inputs.sex);
  const tdee = calculateTDEE(bmr, inputs.activityLevel);
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  
  // Goal-based calorie target
  const { calories: dailyCalories, deficit, clamped } = calculateDailyCalories(
    tdee,
    inputs.goal,
    inputs.sex,
    inputs.targetWeightKg,
    weightKg,
    inputs.timeframeWeeks
  );
  
  // Macros
  const proteinTarget = calculateProtein(weightKg, inputs.goal);
  const macros = calculateMacros(dailyCalories, proteinTarget);
  
  // Water intake
  const water = calculateWaterIntake(weightKg);
  
  // Weight change projections
  const { weeklyKg, isSafe } = calculateWeightChangeRate(deficit, inputs.goal);
  const weeksToGoal = estimateTimeToGoal(
    weightKg,
    inputs.targetWeightKg,
    weeklyKg
  );
  
  // Activity recommendations
  const caloriesToBurn = calculateCaloriesToBurn(inputs.goal);
  const activities = getActivityRecommendations(caloriesToBurn, weightKg);
  
  const minCalories = inputs.sex === "male" ? 1500 : 1200;
  const maxCalories = tdee + 1000;
  
  return {
    bmr,
    tdee,
    bmi,
    bmiCategory,
    dailyCalories,
    calorieDeficitSurplus: deficit,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs,
    waterIntakeMl: water.ml,
    waterIntakeLiters: water.liters,
    weeklyWeightChangeKg: weeklyKg,
    estimatedWeeksToGoal: weeksToGoal,
    isSafeRate: isSafe,
    dailyCaloriesToBurn: caloriesToBurn,
    activities,
    minCalories,
    maxCalories,
    isCalorieClamped: clamped,
  };
}

// NutriVision — Interactive Daily Calories & Macro Calculator
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Flame, TrendingDown, Scale, TrendingUp, Sparkles, Check,
  Activity, Droplets, Info, Award, Dumbbell, ArrowRight, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  calculateAllMetrics,
  type Goal,
  type ActivityLevel,
  type DietPreference,
} from '../lib/calorieCalculations';
import { MacroPieChart } from '../components/MacroPieChart';
import { WeightProgressChart } from '../components/WeightProgressChart';
import './CalorieCalculatorPage.css';

type Units = 'us' | 'metric';
type Sex = 'male' | 'female';

const ACTIVITY_LEVELS: { id: ActivityLevel; short: string; detail: string }[] = [
  { id: 'sedentary', short: 'Sedentary', detail: 'Little or no exercise' },
  { id: 'light', short: 'Light', detail: '1–3 days / week' },
  { id: 'moderate', short: 'Moderate', detail: '3–5 days / week' },
  { id: 'active', short: 'Active', detail: '6–7 days / week' },
  { id: 'very_active', short: 'Very Active', detail: 'Intense daily exercise' },
];

const GOAL_OPTIONS: { id: Goal; label: string; icon: string; desc: string }[] = [
  { id: 'loss', label: 'Weight Loss', icon: '📉', desc: 'Burn fat with healthy deficit' },
  { id: 'maintain', label: 'Maintenance', icon: '⚖️', desc: 'Keep current weight & health' },
  { id: 'gain', label: 'Weight Gain', icon: '📈', desc: 'Build lean mass & strength' },
];

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Animated Count-Up Number Hook */
function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (Math.abs(target - from) < 0.5) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function AnimatedNumber({ value }: { value: number }) {
  const display = useCountUp(value);
  return <>{fmt(display)}</>;
}

export function CalorieCalculatorPage() {
  const { profile, nutritionGoals, setNutritionGoals } = useAppStore();

  // Initialize from user profile if available
  const initialAge = profile?.age || 28;
  const initialSex: Sex = profile?.gender === 'female' ? 'female' : 'male';
  const initialHeightCm = profile?.heightCm || 175;
  const initialWeightKg = profile?.weightKg || 75;

  const [units, setUnits] = useState<Units>('metric');
  const [age, setAge] = useState(initialAge);
  const [sex, setSex] = useState<Sex>(initialSex);

  // Height states
  const [heightCm, setHeightCm] = useState(initialHeightCm);
  const [heightFt, setHeightFt] = useState(Math.floor(initialHeightCm / 30.48));
  const [heightIn, setHeightIn] = useState(Math.round((initialHeightCm % 30.48) / 2.54));

  // Weight states
  const [weightKg, setWeightKg] = useState(initialWeightKg);
  const [weightLb, setWeightLb] = useState(Math.round(initialWeightKg * 2.20462));

  // Goal & activity
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>(
    profile?.goal === 'lose' ? 'loss' : profile?.goal === 'gain' ? 'gain' : 'maintain'
  );

  // Target weight & timeframe
  const [targetWeightKg, setTargetWeightKg] = useState<number | undefined>(undefined);
  const [targetWeightLb, setTargetWeightLb] = useState<number | undefined>(undefined);
  const [timeframeWeeks, setTimeframeWeeks] = useState<number | undefined>(12);
  const [dietPreference, setDietPreference] = useState<DietPreference>('none');

  const [showResults, setShowResults] = useState(true);
  const [pulse, setPulse] = useState(0);

  // Calculate metrics
  const results = useMemo(() => {
    const rawCm = units === 'us' ? (heightFt * 12 + (heightIn || 0)) * 2.54 : heightCm;
    const rawKg = units === 'us' ? (weightLb || 0) / 2.20462 : weightKg;
    const targetKg =
      goal !== 'maintain' && targetWeightKg
        ? targetWeightKg
        : goal !== 'maintain' && targetWeightLb && units === 'us'
          ? targetWeightLb / 2.20462
          : undefined;

    return calculateAllMetrics({
      age: Math.max(10, Math.min(100, age)),
      sex,
      heightCm: Math.max(50, Math.min(250, rawCm)),
      weightKg: Math.max(20, Math.min(300, rawKg)),
      activityLevel: activity,
      goal,
      targetWeightKg: targetKg,
      timeframeWeeks,
      dietPreference,
    });
  }, [
    age, sex, units, heightFt, heightIn, heightCm, weightLb, weightKg,
    activity, goal, targetWeightKg, targetWeightLb, timeframeWeeks, dietPreference
  ]);

  const currentWeightKg = units === 'us' ? weightLb / 2.20462 : weightKg;

  // Calorie Bands
  const pct = (v: number) => (results.tdee > 0 ? Math.round((v / results.tdee) * 100) : 100);
  const bands = [
    { label: 'Maintain', value: results.tdee, color: '#A9B887', desc: 'Hold current mass' },
    { label: 'Mild loss', value: Math.max(results.minCalories, results.tdee - 250), color: '#C5D89A', desc: '−0.25 kg / week' },
    { label: 'Standard loss', value: Math.max(results.minCalories, results.tdee - 500), color: '#A9B887', desc: '−0.50 kg / week' },
    { label: 'Weight gain', value: results.tdee + 400, color: '#A9B887', desc: '+0.35 kg / week' },
  ];

  const handleCompute = () => {
    setPulse(p => p + 1);
    setShowResults(true);
    toast.success('Calculated personalized nutrition metrics!', { id: 'calc-toast' });
  };

  const handleApplyToGoals = () => {
    setNutritionGoals({
      calories: results.dailyCalories,
      protein: results.protein,
      carbohydrates: results.carbs,
      fat: results.fat,
      water: results.waterIntakeMl,
    });
    toast.success(`Applied ${results.dailyCalories} kcal & macro targets to your daily NutriVision goals!`, {
      icon: '🎯',
      duration: 4000,
    });
  };

  return (
    <div className="calc-page">
      <div className="calc-container">
        {/* Header */}
        <div className="calc-header">
          <div className="calc-badge">
            <Flame size={14} /> Science-Backed Mifflin-St Jeor Formula
          </div>
          <h1 className="calc-title">
            Daily Calorie & <span>Macro Calculator</span>
          </h1>
          <p className="calc-subtitle">
            Calculate your Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE),
            macronutrient distribution, and healthy targets for losing, maintaining, or gaining weight.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="calc-goals-grid">
          {GOAL_OPTIONS.map(opt => {
            const isActive = goal === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGoal(opt.id)}
                className={`calc-goal-btn ${isActive ? 'calc-goal-btn--active' : ''}`}
                id={`calc-goal-${opt.id}`}
              >
                <span className="calc-goal-icon">{opt.icon}</span>
                <span className="calc-goal-label">{opt.label}</span>
                <span className="calc-goal-desc">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Layout */}
        <div className="calc-main-layout">
          {/* Left: Input Parameters */}
          <aside className="calc-sidebar">
            <div className="calc-sidebar-header">
              <h2 className="calc-sidebar-title">Body Metrics</h2>
              <div className="calc-unit-toggle">
                <button
                  type="button"
                  onClick={() => setUnits('metric')}
                  className={`calc-unit-btn ${units === 'metric' ? 'calc-unit-btn--active' : ''}`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => setUnits('us')}
                  className={`calc-unit-btn ${units === 'us' ? 'calc-unit-btn--active' : ''}`}
                >
                  US
                </button>
              </div>
            </div>

            {/* Age & Sex */}
            <div className="calc-form-group">
              <label htmlFor="calc-age" className="calc-form-label">Age (years)</label>
              <input
                id="calc-age"
                type="number"
                min={12}
                max={95}
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="calc-input"
              />
            </div>

            <div className="calc-form-group">
              <span className="calc-form-label">Biological Sex</span>
              <div className="calc-grid-2">
                {(['male', 'female'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={`calc-pill-btn ${sex === s ? 'calc-pill-btn--active' : ''}`}
                  >
                    {s === 'male' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>

            {/* Height */}
            <div className="calc-form-group">
              <span className="calc-form-label">Height {units === 'us' ? '(ft & in)' : '(cm)'}</span>
              {units === 'us' ? (
                <div className="calc-grid-2">
                  <input
                    type="number"
                    min={3}
                    max={8}
                    value={heightFt}
                    onChange={e => setHeightFt(Number(e.target.value))}
                    placeholder="Feet"
                    className="calc-input"
                  />
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={e => setHeightIn(Number(e.target.value))}
                    placeholder="Inches"
                    className="calc-input"
                  />
                </div>
              ) : (
                <input
                  type="number"
                  min={80}
                  max={240}
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="calc-input"
                />
              )}
            </div>

            {/* Weight */}
            <div className="calc-form-group">
              <label htmlFor="calc-weight" className="calc-form-label">
                Current Weight {units === 'us' ? '(lb)' : '(kg)'}
              </label>
              <input
                id="calc-weight"
                type="number"
                min={units === 'us' ? 50 : 25}
                max={units === 'us' ? 600 : 280}
                value={units === 'us' ? weightLb : weightKg}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (units === 'us') {
                    setWeightLb(val);
                    setWeightKg(Math.round(val / 2.20462));
                  } else {
                    setWeightKg(val);
                    setWeightLb(Math.round(val * 2.20462));
                  }
                }}
                className="calc-input"
              />
            </div>

            {/* Activity Level */}
            <div className="calc-form-group">
              <span className="calc-form-label">Physical Activity Level</span>
              <div className="calc-activity-list">
                {ACTIVITY_LEVELS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActivity(a.id)}
                    className={`calc-activity-btn ${activity === a.id ? 'calc-activity-btn--active' : ''}`}
                  >
                    <span>{a.short}</span>
                    <span className="calc-activity-sub">{a.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Weight & Timeframe (for loss / gain) */}
            {goal !== 'maintain' && (
              <>
                <div className="calc-form-group">
                  <label htmlFor="calc-target-wt" className="calc-form-label">
                    Goal Target Weight {units === 'us' ? '(lb)' : '(kg)'} (Optional)
                  </label>
                  <input
                    id="calc-target-wt"
                    type="number"
                    value={units === 'us' ? targetWeightLb || '' : targetWeightKg || ''}
                    placeholder={goal === 'loss' ? (units === 'us' ? 'e.g. 150' : 'e.g. 68') : (units === 'us' ? 'e.g. 175' : 'e.g. 80')}
                    onChange={e => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      if (units === 'us') {
                        setTargetWeightLb(val);
                        setTargetWeightKg(val ? Math.round(val / 2.20462) : undefined);
                      } else {
                        setTargetWeightKg(val);
                        setTargetWeightLb(val ? Math.round(val * 2.20462) : undefined);
                      }
                    }}
                    className="calc-input"
                  />
                </div>

                <div className="calc-form-group">
                  <label htmlFor="calc-timeframe" className="calc-form-label">
                    Timeframe (Weeks)
                  </label>
                  <input
                    id="calc-timeframe"
                    type="number"
                    min={2}
                    max={52}
                    value={timeframeWeeks || ''}
                    placeholder="12"
                    onChange={e => setTimeframeWeeks(e.target.value ? Number(e.target.value) : undefined)}
                    className="calc-input"
                  />
                </div>
              </>
            )}

            {/* Diet Preference */}
            <div className="calc-form-group">
              <span className="calc-form-label">Dietary Preference</span>
              <div className="calc-grid-3">
                {([
                  { id: 'none', label: 'Any' },
                  { id: 'veg', label: 'Vegetarian' },
                  { id: 'non-veg', label: 'Non-Veg' },
                ] as const).map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietPreference(d.id)}
                    className={`calc-pill-btn ${dietPreference === d.id ? 'calc-pill-btn--active' : ''}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompute}
              className="calc-compute-btn"
              id="calc-recalculate-btn"
            >
              <Flame size={18} /> Recalculate Model
            </button>
          </aside>

          {/* Right: Output Results */}
          <main key={pulse} className="calc-results-area">
            {showResults ? (
              <>
                {/* Hero Readout Card */}
                <section className="calc-hero-card">
                  <div className="calc-hero-top">
                    <span className="calc-hero-badge">
                      {goal === 'loss' ? '🎯 Recommended Weight Loss Target' : goal === 'gain' ? '💪 Recommended Weight Gain Target' : '⚖️ Daily Maintenance Target'}
                    </span>
                    <span className="calc-hero-bmr-tdee">
                      BMR: {fmt(results.bmr)} kcal · TDEE: {fmt(results.tdee)} kcal
                    </span>
                  </div>

                  <div className="calc-hero-target">
                    <span className="calc-hero-number">
                      <AnimatedNumber value={results.dailyCalories} />
                    </span>
                    <span className="calc-hero-unit">kcal / day</span>
                  </div>

                  <div className="calc-hero-metrics">
                    <div className="calc-metric-item">
                      <span className="calc-metric-label">BMI</span>
                      <span className="calc-metric-val">
                        {results.bmi} <span style={{ fontSize: '0.85rem', color: '#A9B887' }}>({results.bmiCategory})</span>
                      </span>
                    </div>

                    <div className="calc-metric-item">
                      <span className="calc-metric-label">Deficit / Surplus</span>
                      <span className="calc-metric-val" style={{ color: results.calorieDeficitSurplus >= 0 ? '#A9B887' : '#A9B887' }}>
                        {results.calorieDeficitSurplus > 0 ? `+${results.calorieDeficitSurplus}` : results.calorieDeficitSurplus} kcal
                      </span>
                    </div>

                    {goal !== 'maintain' && results.estimatedWeeksToGoal && (
                      <div className="calc-metric-item">
                        <span className="calc-metric-label">Est. Time to Goal</span>
                        <span className="calc-metric-val">{results.estimatedWeeksToGoal} weeks</span>
                      </div>
                    )}

                    <div className="calc-metric-item">
                      <span className="calc-metric-label">Weekly Change</span>
                      <span className="calc-metric-val">
                        {results.weeklyWeightChangeKg > 0 ? `+${results.weeklyWeightChangeKg}` : results.weeklyWeightChangeKg} kg
                      </span>
                    </div>
                  </div>

                  {results.isCalorieClamped && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(169, 184, 135, 0.15)', borderRadius: '0.75rem', border: '1px solid rgba(169, 184, 135, 0.3)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#A9B887' }}>
                      <ShieldAlert size={16} />
                      <span>Notice: Intake was adjusted to your healthy biological minimum ({results.minCalories} kcal) for safety.</span>
                    </div>
                  )}

                  {/* Apply to NutriVision goals */}
                  <div className="calc-apply-bar">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sync with NutriVision</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(232,233,223,0.65)' }}>
                        Save this calorie & macro distribution directly to your active tracker and meal planner.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyToGoals}
                      className="calc-apply-btn"
                      id="calc-apply-goals-btn"
                    >
                      <Check size={16} /> Apply to My Nutrition Goals
                    </button>
                  </div>
                </section>

                {/* 4 Stat Cards */}
                <div className="calc-cards-grid">
                  <div className="calc-stat-card">
                    <div className="calc-stat-header">
                      <span className="calc-stat-dot" style={{ background: '#A9B887' }} />
                      <span className="calc-stat-name">Protein</span>
                    </div>
                    <div className="calc-stat-value">
                      <AnimatedNumber value={results.protein} />
                      <span style={{ fontSize: '1.2rem', color: 'rgba(232,233,223,0.6)' }}> g</span>
                    </div>
                    <div className="calc-stat-sub">
                      {Math.round((results.protein / currentWeightKg) * 10) / 10} g / kg body weight
                    </div>
                  </div>

                  <div className="calc-stat-card">
                    <div className="calc-stat-header">
                      <span className="calc-stat-dot" style={{ background: '#A9B887' }} />
                      <span className="calc-stat-name">Carbohydrates</span>
                    </div>
                    <div className="calc-stat-value">
                      <AnimatedNumber value={results.carbs} />
                      <span style={{ fontSize: '1.2rem', color: 'rgba(232,233,223,0.6)' }}> g</span>
                    </div>
                    <div className="calc-stat-sub">
                      {results.dailyCalories > 0 ? Math.round(((results.carbs * 4) / results.dailyCalories) * 100) : 0}% of daily calories
                    </div>
                  </div>

                  <div className="calc-stat-card">
                    <div className="calc-stat-header">
                      <span className="calc-stat-dot" style={{ background: '#8C6D53' }} />
                      <span className="calc-stat-name">Healthy Fats</span>
                    </div>
                    <div className="calc-stat-value">
                      <AnimatedNumber value={results.fat} />
                      <span style={{ fontSize: '1.2rem', color: 'rgba(232,233,223,0.6)' }}> g</span>
                    </div>
                    <div className="calc-stat-sub">
                      {results.dailyCalories > 0 ? Math.round(((results.fat * 9) / results.dailyCalories) * 100) : 0}% of daily calories
                    </div>
                  </div>

                  <div className="calc-stat-card">
                    <div className="calc-stat-header">
                      <span className="calc-stat-dot" style={{ background: '#A9B887' }} />
                      <span className="calc-stat-name">Water Intake</span>
                    </div>
                    <div className="calc-stat-value">
                      {results.waterIntakeLiters}
                      <span style={{ fontSize: '1.2rem', color: 'rgba(232,233,223,0.6)' }}> L</span>
                    </div>
                    <div className="calc-stat-sub">
                      ~{fmt(results.waterIntakeMl)} ml per day
                    </div>
                  </div>
                </div>

                {/* Macro & Progress Charts */}
                <div className="calc-charts-grid">
                  <div className="calc-chart-card">
                    <div className="calc-chart-title">
                      <span>Macro Energy Split</span>
                      <span style={{ fontSize: '0.85rem', color: '#A9B887' }}>{fmt(results.dailyCalories)} kcal</span>
                    </div>
                    <MacroPieChart
                      protein={results.protein}
                      carbs={results.carbs}
                      fat={results.fat}
                    />
                  </div>

                  {goal !== 'maintain' && targetWeightKg && results.estimatedWeeksToGoal ? (
                    <div className="calc-chart-card">
                      <div className="calc-chart-title">
                        <span>Projected Weight Journey</span>
                        <span style={{ fontSize: '0.85rem', color: '#A9B887' }}>{results.estimatedWeeksToGoal} Weeks Target</span>
                      </div>
                      <WeightProgressChart
                        currentWeight={currentWeightKg}
                        targetWeight={targetWeightKg}
                        weeklyChange={results.weeklyWeightChangeKg}
                        weeks={results.estimatedWeeksToGoal}
                      />
                    </div>
                  ) : (
                    <div className="calc-chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="calc-chart-title">
                        <span>Daily Energy Distribution</span>
                        <span style={{ fontSize: '0.85rem', color: '#A9B887' }}>Balanced Meals</span>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(46,61,40,0.4)', borderRadius: '1rem', lineHeight: '1.7', fontSize: '0.9rem' }}>
                        <div>🍳 <strong>Breakfast:</strong> ~{Math.round(results.dailyCalories * 0.25)} kcal (25%)</div>
                        <div>🥗 <strong>Lunch:</strong> ~{Math.round(results.dailyCalories * 0.35)} kcal (35%)</div>
                        <div>🍲 <strong>Dinner:</strong> ~{Math.round(results.dailyCalories * 0.30)} kcal (30%)</div>
                        <div>🍎 <strong>Snacks:</strong> ~{Math.round(results.dailyCalories * 0.10)} kcal (10%)</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercise & Activity Burn Table */}
                {goal === 'loss' && (
                  <div className="calc-table-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E8E9DF' }}>
                          Accelerate Weight Loss Through Activity
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(232,233,223,0.65)' }}>
                          Recommended extra burn: ~{fmt(results.dailyCaloriesToBurn)} kcal / day to reach your target comfortably.
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A9B887', fontSize: '0.85rem' }}>
                        <Activity size={16} /> Active Burn
                      </div>
                    </div>

                    <table className="calc-table">
                      <thead>
                        <tr>
                          <th>Activity</th>
                          <th style={{ textAlign: 'center' }}>Suggested Duration</th>
                          <th style={{ textAlign: 'right' }}>Est. Calories Burned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.activities.map((act, i) => (
                          <tr key={i}>
                            <td>{act.name}</td>
                            <td style={{ textAlign: 'center', color: '#A9B887', fontWeight: 600 }}>{act.durationMinutes} min</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>~{fmt(act.totalCalories)} kcal</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Guidance & Strategy */}
                <div className="calc-guidance-card">
                  <h3 className="calc-guidance-title">
                    {goal === 'loss' ? '🎯 Weight Loss Strategy' : goal === 'gain' ? '💪 Healthy Weight Gain Strategy' : '⚖️ Weight Maintenance Strategy'}
                  </h3>

                  <div className="calc-guidance-section">
                    <h4 className="calc-guidance-subtitle">Nutritional Focus:</h4>
                    <ul className="calc-guidance-list">
                      <li className="calc-guidance-item">
                        Hit your protein target of <strong>{results.protein}g/day</strong> to preserve and build lean muscle tissue.
                      </li>
                      <li className="calc-guidance-item">
                        Drink at least <strong>{results.waterIntakeLiters}L of water</strong> daily to sustain cellular metabolism and energy.
                      </li>
                      <li className="calc-guidance-item">
                        Prioritize nutrient-dense whole foods: leafy greens, whole grains, healthy fats, and minimally processed ingredients.
                      </li>
                    </ul>
                  </div>

                  <div className="calc-guidance-section" style={{ marginBottom: 0 }}>
                    <h4 className="calc-guidance-subtitle">Exercise Recommendations:</h4>
                    <ul className="calc-guidance-list">
                      <li className="calc-guidance-item">
                        Aim for 3–4 strength sessions per week to preserve metabolic rate and bone density.
                      </li>
                      <li className="calc-guidance-item">
                        Complement with 150 minutes of moderate cardiovascular movement (brisk walking, cycling, or swimming).
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Reference Bands */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,233,223,0.6)', marginBottom: '0.75rem' }}>
                    Reference Calorie Bands
                  </h3>
                  <div className="calc-bands-grid">
                    {bands.map(band => {
                      const p = pct(band.value);
                      return (
                        <div key={band.label} className="calc-band-card">
                          <div className="calc-band-header">
                            <span className="calc-band-label" style={{ color: band.color }}>{band.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(232,233,223,0.6)' }}>{p}%</span>
                          </div>
                          <div className="calc-band-val">{fmt(band.value)}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(232,233,223,0.65)' }}>{band.desc}</div>
                          <div className="calc-band-progress">
                            <div className="calc-band-fill" style={{ width: `${Math.min(100, p)}%`, background: band.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="calc-empty-card">
                <div className="calc-empty-icon">📊</div>
                <div className="calc-empty-text">Fill in your body metrics on the left to calculate your personalized nutrition targets.</div>
                <div className="calc-empty-sub">Your data will generate precise BMR, TDEE, and macronutrient breakdowns.</div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

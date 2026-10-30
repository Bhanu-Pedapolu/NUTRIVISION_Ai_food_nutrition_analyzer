// NutriVision — Nutrition Analytics & Tracker Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Droplets, Plus, RotateCcw, Calendar, Flame,
  Award, CheckCircle2, ChevronRight, BarChart2, PieChart as PieIcon,
  Trash2, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { useAppStore } from '../store/useAppStore';
import './AnalyticsPage.css';

const WEEKLY_DATA = [
  { day: 'Mon', calories: 1940, target: 2000, protein: 55, carbs: 220, fat: 58 },
  { day: 'Tue', calories: 2120, target: 2000, protein: 62, carbs: 260, fat: 68 },
  { day: 'Wed', calories: 1850, target: 2000, protein: 48, carbs: 210, fat: 52 },
  { day: 'Thu', calories: 2050, target: 2000, protein: 58, carbs: 245, fat: 64 },
  { day: 'Fri', calories: 2280, target: 2000, protein: 70, carbs: 280, fat: 72 },
  { day: 'Sat', calories: 1980, target: 2000, protein: 52, carbs: 230, fat: 60 },
  { day: 'Sun', calories: 1890, target: 2000, protein: 50, carbs: 215, fat: 55 },
];

export function AnalyticsPage() {
  const {
    analysisHistory, hydrationLog, addHydration, resetHydration,
    nutritionGoals
  } = useAppStore();

  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Calculate today's intake from history
  const todayStr = new Date().toDateString();
  const todayMeals = analysisHistory.filter(item => {
    return new Date(item.createdAt).toDateString() === todayStr;
  });

  const totalCalories = todayMeals.reduce((sum, item) => sum + (item.nutrition.calories * item.currentServings), 0) || 1280;
  const totalProtein = todayMeals.reduce((sum, item) => sum + (item.nutrition.protein * item.currentServings), 0) || 48;
  const totalCarbs = todayMeals.reduce((sum, item) => sum + (item.nutrition.carbohydrates * item.currentServings), 0) || 165;
  const totalFat = todayMeals.reduce((sum, item) => sum + (item.nutrition.fat * item.currentServings), 0) || 42;
  const totalFiber = todayMeals.reduce((sum, item) => sum + (item.nutrition.fiber * item.currentServings), 0) || 18;

  const targetCalories = nutritionGoals?.calories || 2000;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const macroPieData = [
    { name: 'Protein', value: totalProtein * 4, color: '#A9B887', grams: totalProtein },
    { name: 'Carbs', value: totalCarbs * 4, color: '#A9B887', grams: totalCarbs },
    { name: 'Fat', value: totalFat * 9, color: '#E8E9DF', grams: totalFat },
  ];

  const hydrationPct = Math.min(100, Math.round((hydrationLog.totalMl / hydrationLog.goalMl) * 100));

  const handleExportSummary = () => {
    const reportText = `NutriVision Daily Nutrition Report\nDate: ${new Date().toLocaleDateString()}\nCalories: ${totalCalories} / ${targetCalories} kcal\nProtein: ${totalProtein}g\nCarbs: ${totalCarbs}g\nFat: ${totalFat}g\nFiber: ${totalFiber}g\nHydration: ${hydrationLog.totalMl} / ${hydrationLog.goalMl} ml\nMeals Logged: ${todayMeals.length}`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrivision-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success('Nutrition report downloaded!');
  };

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <div className="container">
          <div className="analytics-header-row">
            <div>
              <span className="badge badge-accent">
                <BarChart2 size={14} /> Comprehensive Metrics
              </span>
              <h1 className="analytics-title">Nutrition & Wellness Tracker</h1>
              <p className="analytics-subtitle">
                Real-time caloric balance, macronutrient ratios, hydration logs, and daily food diary.
              </p>
            </div>
            <div className="analytics-actions">
              <HoverButton
                className="text-xs px-3.5 py-1.5 font-medium"
                backgroundColor="rgba(169,184,135,0.2)"
                textColor="#2E3D28"
                hovertextColor="#2E3D28"
                glowColor="#A9B887"
                onClick={handleExportSummary}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Download size={14} /> Export Report
                </span>
              </HoverButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Top Summary Cards */}
        <div className="summary-cards-grid">
          {/* Calories Ring Card */}
          <div className="analytics-card calorie-balance-card">
            <div className="card-top-label">
              <span>Calories Consumed</span>
              <Flame size={16} color="#A9B887" />
            </div>
            <div className="calorie-gauge-row">
              <div className="calorie-numbers">
                <h2>{totalCalories} <span className="unit">kcal</span></h2>
                <p>Target: {targetCalories} kcal ({targetCalories - totalCalories > 0 ? `${targetCalories - totalCalories} remaining` : 'Target reached'})</p>
              </div>
              <div className="progress-circular">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-val"
                    strokeDasharray={`${caloriePercent}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="circle-text">{caloriePercent}%</text>
                </svg>
              </div>
            </div>
            <div className="calorie-meter">
              <div className="meter-fill" style={{ width: `${caloriePercent}%` }}></div>
            </div>
          </div>

          {/* Protein Target */}
          <div className="analytics-card metric-pill-card">
            <div className="card-top-label">
              <span>Protein Goal</span>
              <span className="dot pro"></span>
            </div>
            <h3>{totalProtein}g <span className="unit">/ {nutritionGoals.protein || 65}g</span></h3>
            <div className="metric-bar-wrap">
              <div
                className="metric-bar-fill pro"
                style={{ width: `${Math.min(100, (totalProtein / (nutritionGoals.protein || 65)) * 100)}%` }}
              ></div>
            </div>
            <p className="metric-sub">Muscle repair & metabolic health</p>
          </div>

          {/* Carbs Target */}
          <div className="analytics-card metric-pill-card">
            <div className="card-top-label">
              <span>Carbohydrates</span>
              <span className="dot carb"></span>
            </div>
            <h3>{totalCarbs}g <span className="unit">/ {nutritionGoals.carbohydrates || 240}g</span></h3>
            <div className="metric-bar-wrap">
              <div
                className="metric-bar-fill carb"
                style={{ width: `${Math.min(100, (totalCarbs / (nutritionGoals.carbohydrates || 240)) * 100)}%` }}
              ></div>
            </div>
            <p className="metric-sub">Sustained glucose & daily stamina</p>
          </div>

          {/* Healthy Fat Target */}
          <div className="analytics-card metric-pill-card">
            <div className="card-top-label">
              <span>Fats & Lipids</span>
              <span className="dot fat"></span>
            </div>
            <h3>{totalFat}g <span className="unit">/ {nutritionGoals.fat || 65}g</span></h3>
            <div className="metric-bar-wrap">
              <div
                className="metric-bar-fill fat"
                style={{ width: `${Math.min(100, (totalFat / (nutritionGoals.fat || 65)) * 100)}%` }}
              ></div>
            </div>
            <p className="metric-sub">Hormone balance & brain wellness</p>
          </div>
        </div>

        {/* Charts Section: Weekly Trends + Macro Split */}
        <div className="charts-double-grid">
          {/* Weekly Calorie Burn/Intake Trend */}
          <div className="analytics-card chart-container-card">
            <div className="chart-header">
              <div>
                <h3>Caloric Intake Trend</h3>
                <p>7-Day intake vs recommended target line</p>
              </div>
              <div className="chart-tabs">
                <button
                  className={`chart-tab ${timeRange === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  This Week
                </button>
              </div>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A9B887" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#A9B887" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(169,184,135,0.15)" />
                  <XAxis dataKey="day" stroke="rgba(169,184,135,0.6)" fontSize={12} tickLine={false} />
                  <YAxis stroke="rgba(169,184,135,0.6)" fontSize={12} tickLine={false} domain={[1200, 2600]} />
                  <Tooltip
                    contentStyle={{ background: '#E8E9DF', border: '1px solid rgba(169,184,135,0.6)', borderRadius: 12, color: '#ffffff' }}
                    labelStyle={{ color: '#E8E9DF', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#A9B887" strokeWidth={3} fillOpacity={1} fill="url(#calColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Calorie Distribution Donut */}
          <div className="analytics-card chart-container-card">
            <div className="chart-header">
              <div>
                <h3>Macronutrient Split</h3>
                <p>Proportion of total energy intake</p>
              </div>
              <PieIcon size={18} color="rgba(169,184,135,0.6)" />
            </div>

            <div className="donut-and-legend">
              <div className="donut-chart-box">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={macroPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {macroPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#E8E9DF', border: '1px solid rgba(169,184,135,0.6)', borderRadius: 12, color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="macro-legend-list">
                {macroPieData.map(item => (
                  <div key={item.name} className="legend-row">
                    <span className="legend-swatch" style={{ background: item.color }}></span>
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-grams">{item.grams}g</span>
                    <span className="legend-cal">({item.value} kcal)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Tracker Card */}
        <div className="analytics-card hydration-card">
          <div className="hydration-header-row">
            <div className="hydration-title-wrap">
              <div className="hydration-badge-icon">
                <Droplets size={24} />
              </div>
              <div>
                <h3>Hydration Tracker</h3>
                <p>Target: {hydrationLog.goalMl} ml daily • Current: {hydrationLog.totalMl} ml</p>
              </div>
            </div>

            <div className="hydration-actions">
              <HoverButton
                className="text-xs px-3 py-1.5 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                textColor="#ffffff"
                hoverTextColor="#E8E9DF"
                onClick={() => { addHydration(250); toast.success('+250ml logged!', { icon: '💧' }); }}
              >
                <span className="inline-flex items-center gap-1">
                  <Plus size={14} /> 250ml
                </span>
              </HoverButton>
              <HoverButton
                className="text-xs px-3 py-1.5 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                textColor="#ffffff"
                hoverTextColor="#E8E9DF"
                onClick={() => { addHydration(500); toast.success('+500ml logged!', { icon: '💧' }); }}
              >
                <span className="inline-flex items-center gap-1">
                  <Plus size={14} /> 500ml
                </span>
              </HoverButton>
              <HoverButton
                className="text-xs px-2.5 py-1.5 font-medium"
                backgroundColor="transparent"
                textColor="rgba(169,184,135,0.6)"
                hoverTextColor="#A9B887"
                glowColor="#A9B887"
                onClick={() => { resetHydration(); toast('Hydration reset', { icon: '🔄' }); }}
                title="Reset today's water"
              >
                <RotateCcw size={14} />
              </HoverButton>
            </div>
          </div>

          <div className="hydration-tank-outer">
            <div className="hydration-tank-fill" style={{ width: `${hydrationPct}%` }}>
              <span className="hydration-tank-text">{hydrationLog.totalMl} / {hydrationLog.goalMl} ml ({hydrationPct}%)</span>
            </div>
          </div>
        </div>

        {/* Today's Food Diary */}
        <div className="analytics-card diary-card">
          <div className="card-top-label">
            <h3>Today's Food Diary</h3>
            <span className="badge badge-neutral">{todayMeals.length} Items Logged</span>
          </div>

          <div className="diary-items-list">
            {todayMeals.length === 0 ? (
              <div className="diary-empty-state">
                <Flame size={32} color="#A9B887" />
                <p>No meals logged yet today.</p>
                <HoverButton
                  className="text-xs px-4 py-2 font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#ffffff"
                  hoverTextColor="#ffffff"
                  onClick={() => navigate('/analyze')}
                >
                  Scan a Meal Now
                </HoverButton>
              </div>
            ) : (
              todayMeals.map((item, idx) => (
                <div key={item.id || idx} className="diary-row">
                  <img src={item.imageUrl} alt={item.foodName} className="diary-thumb" />
                  <div className="diary-info">
                    <h4>{item.foodName}</h4>
                    <p>{item.currentServings} serving(s) • Logged at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="diary-metrics">
                    <span className="diary-cal">{Math.round(item.nutrition.calories * item.currentServings)} kcal</span>
                    <span className="diary-macros">
                      {Math.round(item.nutrition.protein * item.currentServings)}g P • {Math.round(item.nutrition.carbohydrates * item.currentServings)}g C • {Math.round(item.nutrition.fat * item.currentServings)}g F
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

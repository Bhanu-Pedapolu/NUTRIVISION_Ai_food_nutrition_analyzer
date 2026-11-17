import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { Camera, Upload, QrCode, Droplets, TrendingUp, Calendar, Leaf, Plus, ChevronRight, Zap, Flame, Bot, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherFromGeolocation, DEMO_WEATHER } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';
import { DEMO_MEAL_PLAN, FOOD_IMAGES } from '../data/demoData';
import { RadialBarChart, RadialBar, Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';
import { HydrationCard } from '../components/HydrationCard';
import { ScanGridButton } from '../components/ScanGridButton';
import { TinctureSlosh } from '../components/TinctureSlosh';
import { IsometricButton } from '../components/IsometricButton';
import { GlowButton } from '../components/GlowButton';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const TODAY = new Date();
const DAY_NAME = TODAY.toLocaleDateString('en-IN', { weekday: 'long' });
const DATE_STR = TODAY.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

export function DashboardPage() {
  const { userName, profile, analysisHistory, hydrationLog, addHydration, nutritionGoals } = useAppStore();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const displayName = userName?.split(' ')[0] || 'there';

  // Calories consumed today (from history)
  const todayAnalyses = analysisHistory.filter(a => {
    const d = new Date(a.createdAt);
    return d.toDateString() === TODAY.toDateString();
  });
  const caloriesConsumed = todayAnalyses.reduce((s, a) => s + a.nutrition.calories * a.currentServings, 0);
  const caloriesGoal = nutritionGoals?.calories || 2000;
  const caloriesPct = Math.min(100, Math.round((caloriesConsumed / caloriesGoal) * 100));

  // Today's meal plan
  const todayPlan = DEMO_MEAL_PLAN.days.find(d => d.dayName === DAY_NAME) || DEMO_MEAL_PLAN.days[4];

  useEffect(() => {
    getWeatherFromGeolocation()
      .then(w => { setWeather(w); setWeatherLoading(false); })
      .catch(() => { setWeather(DEMO_WEATHER); setWeatherLoading(false); });
  }, []);

  const macroData = [
    { name: 'Protein', value: 28, goal: nutritionGoals?.protein || 50, color: '#A9B887' },
    { name: 'Carbs', value: 62, goal: nutritionGoals?.carbohydrates || 250, color: '#E8E9DF' },
    { name: 'Fat', value: 18, goal: nutritionGoals?.fat || 65, color: 'rgba(169,184,135,0.5)' },
    { name: 'Fiber', value: 8, goal: nutritionGoals?.fiber || 25, color: 'rgba(232,233,223,0.6)' },
  ];

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.08 } } },
    item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } },
  };

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div
          className="dashboard__grid"
          variants={stagger.container}
          initial="initial"
          animate="animate"
        >
          {/* ---- TOP ROW ---- */}
          {/* Greeting */}
          <motion.div className="dashboard__greeting" variants={stagger.item}>
            <div className="dashboard__greeting-text">
              <p className="dashboard__greeting-salutation">{GREETING()}, {displayName} 👋</p>
              <h1 className="dashboard__greeting-heading">Here's your nutrition snapshot for today.</h1>
              <p className="dashboard__greeting-date">{DAY_NAME}, {DATE_STR}</p>
            </div>
          </motion.div>

          {/* AI Chatbot Button (Replaced Weather Card) */}
          <motion.div variants={stagger.item}>
            <div
              className="dashboard__chatbot-card"
              id="dashboard-chatbot-btn"
              aria-label="Open NutriBot AI Chat"
            >
              <div className="dashboard__chatbot-card-ambient" />

              <div className="dashboard__chatbot-top">
                <div className="dashboard__chatbot-badge">
                  <span className="dashboard__chatbot-live-dot" />
                  <span>AI ONLINE</span>
                </div>
                <div className="dashboard__chatbot-icon-box">
                  <Bot size={20} aria-hidden="true" />
                </div>
              </div>

              <div className="dashboard__chatbot-info">
                <div className="dashboard__chatbot-title">
                  Ask NutriBot AI
                  <Sparkles size={14} style={{ color: '#C5D89A' }} />
                </div>
                <p className="dashboard__chatbot-desc">
                  Instant guidance on meals, calories & diets
                </p>
              </div>

              {/* Previous button commented out for easy revert:
              <div className="dashboard__chatbot-action-btn">
                <span>Start Chat</span>
                <span className="dashboard__chatbot-arrow">→</span>
              </div>
              */}

              {/* TinctureSlosh WebGL2 Water-Filled Interactive Button (commented for easy revert):
              <div
                className="dashboard__tincture-wrapper"
                style={{ position: 'relative', width: 336, height: 45, marginTop: 'auto' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 840,
                    height: 560,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <TinctureSlosh
                    label="Start Chat →"
                    background="#263521"
                    textColor="#111111"
                    buttonWidth={480}
                    buttonHeight={64}
                    radius={20}
                    fade={2.5}
                    colors={{
                      mode: 'mono',
                      dye: '#7A8B2E',
                      base: '#FFFFFF',
                    }}
                    response={{ pour: 5, stir: 5, swirl: 5, ripple: 5, wobble: 5, reach: 0 }}
                    reflection={{ intensity: 25, distance: 18, blur: 15 }}
                    advanced={{ vignette: 0 }}
                    font={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '26px' }}
                    link="/chat"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </div>
              */}

              {/* IsometricButton (3D Keycap Button with glowing underside) */}
              <div
                className="dashboard__isometric-btn-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 8px',
                  marginTop: 'auto',
                  width: '100%',
                }}
              >
                <IsometricButton
                  label="Start Chat →"
                  rounded={45}
                  padding="18px 36px"
                  font={{
                    fontFamily: "Inter",
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: "0.5px",
                  }}
                  colors={{
                    fill: "#1B2412",
                    textColor: "#B7C86A",
                    hoverTextColor: "#FFFFFF",
                  }}
                  prism={{
                    color: "#7A8B2E",
                    thickness: 15,
                    float: 8,
                    hoverFloat: 7,
                    intensity: 100,
                  }}
                  camera={{ tilt: 49, rotate: -37 }}
                  addIcon={false}
                  icon={{
                    color: "#B7C86A",
                    hoverColor: "#FFFFFF",
                    symbol: "→",
                    size: 20,
                  }}
                  link="/chat"
                  newTab={false}
                  onClick={() => navigate('/chat')}
                />
              </div>
            </div>

            {/* Previous weather card commented for easy revert:
            <Link to="/weather" className={`dashboard__weather-card ${weather ? `weather--${weather.weatherType}` : ''}`} id="dashboard-weather-card">
              {weatherLoading ? (
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)' }} />
              ) : weather ? (
                <>
                  <div className="dashboard__weather-top">
                    <div>
                      <div className="dashboard__weather-temp">{weather.temperature}°C</div>
                      <div className="dashboard__weather-condition">{weather.icon} {weather.condition}</div>
                      <div className="dashboard__weather-city">{weather.city}</div>
                    </div>
                    <div className="dashboard__weather-humidity">
                      <Droplets size={14} />
                      {weather.humidity}% humidity
                    </div>
                  </div>
                  <p className="dashboard__weather-tip">{weather.description}</p>
                </>
              ) : null}
            </Link>
            */}
          </motion.div>

          {/* ---- MAIN ANALYZER CARD ---- */}
          <motion.div className="dashboard__analyzer-card" variants={stagger.item}>
            <div className="dashboard__analyzer-bg">
              <img src="/hero-food.jpg" alt="" className="img-cover" loading="lazy" aria-hidden="true" />
              <div className="dashboard__analyzer-overlay" />
            </div>
            <div className="dashboard__analyzer-content">
              <div>
                <p className="label-overline" style={{ color: 'rgba(255,255,255,0.6)' }}>AI Food Analysis</p>
                <h2 className="dashboard__analyzer-heading">What's on your plate?</h2>
                <p className="dashboard__analyzer-desc">Take a photo or upload a food image to discover what's inside.</p>
              </div>
              <div className="dashboard__analyzer-actions">
                {/* Previous buttons commented out for easy revert:
                <Link to="/analyze?mode=camera" className="dashboard__analyzer-btn" id="dashboard-camera-btn">
                  <Camera size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Take Photo</div>
                    <div className="dashboard__analyzer-btn-sub">Use camera</div>
                  </div>
                </Link>
                <Link to="/analyze?mode=upload" className="dashboard__analyzer-btn" id="dashboard-upload-btn">
                  <Upload size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Upload</div>
                    <div className="dashboard__analyzer-btn-sub">From gallery</div>
                  </div>
                </Link>
                <Link to="/analyze?mode=qr" className="dashboard__analyzer-btn dashboard__analyzer-btn--qr" id="dashboard-qr-btn">
                  <QrCode size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Scan QR</div>
                    <div className="dashboard__analyzer-btn-sub">Use phone camera</div>
                  </div>
                </Link>
                <Link to="/calculator" className="dashboard__analyzer-btn" id="dashboard-calc-btn">
                  <Flame size={20} aria-hidden="true" style={{ color: '#A9B887' }} />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Calculator</div>
                    <div className="dashboard__analyzer-btn-sub">Daily calories</div>
                  </div>
                </Link>
                */}

                <ScanGridButton
                  id="dashboard-camera-btn"
                  label="Take Photo"
                  link="/analyze?mode=camera"
                  rounded={30}
                  padding="16px 40px"
                  font={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: "0.5px", lineHeight: "1.5em" }}
                  colors={{
                    fill: "#FFFFFF",
                    hoverFill: "#F0F7FF",
                    textColor: "#0B2A5B",
                    hoverTextColor: "#0066CC"
                  }}
                  scan={{ color: "#3B9EFF", speed: 50 }}
                  border={{ borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(59,158,255,0.5)" }}
                  glitchIntensity={0}
                  addIcon={false}
                  icon={{ color: "#0B2A5B", hoverColor: "#3B9EFF", symbol: "→", size: 22 }}
                />

                <ScanGridButton
                  id="dashboard-upload-btn"
                  label="Upload"
                  link="/analyze?mode=upload"
                  rounded={30}
                  padding="16px 40px"
                  font={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: "0.5px", lineHeight: "1.5em" }}
                  colors={{
                    fill: "#FFFFFF",
                    hoverFill: "#F0F7FF",
                    textColor: "#0B2A5B",
                    hoverTextColor: "#0066CC"
                  }}
                  scan={{ color: "#3B9EFF", speed: 50 }}
                  border={{ borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(59,158,255,0.5)" }}
                  glitchIntensity={0}
                  addIcon={false}
                  icon={{ color: "#0B2A5B", hoverColor: "#3B9EFF", symbol: "→", size: 22 }}
                />

                <ScanGridButton
                  id="dashboard-qr-btn"
                  label="Scan QR"
                  link="/analyze?mode=qr"
                  rounded={30}
                  padding="16px 40px"
                  font={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: "0.5px", lineHeight: "1.5em" }}
                  colors={{
                    fill: "#FFFFFF",
                    hoverFill: "#F0F7FF",
                    textColor: "#0B2A5B",
                    hoverTextColor: "#0066CC"
                  }}
                  scan={{ color: "#3B9EFF", speed: 50 }}
                  border={{ borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(59,158,255,0.5)" }}
                  glitchIntensity={0}
                  addIcon={false}
                  icon={{ color: "#0B2A5B", hoverColor: "#3B9EFF", symbol: "→", size: 22 }}
                />

                <ScanGridButton
                  id="dashboard-calc-btn"
                  label="Calculator"
                  link="/calculator"
                  rounded={30}
                  padding="16px 40px"
                  font={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: "0.5px", lineHeight: "1.5em" }}
                  colors={{
                    fill: "#FFFFFF",
                    hoverFill: "#F0F7FF",
                    textColor: "#0B2A5B",
                    hoverTextColor: "#0066CC"
                  }}
                  scan={{ color: "#3B9EFF", speed: 50 }}
                  border={{ borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(59,158,255,0.5)" }}
                  glitchIntensity={0}
                  addIcon={false}
                  icon={{ color: "#0B2A5B", hoverColor: "#3B9EFF", symbol: "→", size: 22 }}
                />
              </div>
            </div>
          </motion.div>

          {/* ---- CALORIE RING (Big Amber Number, Walnut Labels, Sage Progress Ring) ---- */}
          <motion.div className="dashboard__calorie-card card card-body" variants={stagger.item}>
            <div className="dashboard__calorie-header">
              <p className="label-overline" style={{ color: '#E8E9DF' }}>Today's Calories</p>
              <Zap size={16} style={{ color: '#A9B887' }} aria-hidden="true" />
            </div>
            <div className="dashboard__calorie-ring">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Consumed', value: caloriesConsumed || 520 },
                      { name: 'Remaining', value: Math.max(0, caloriesGoal - (caloriesConsumed || 520)) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="#A9B887" />
                    <Cell fill="rgba(46,61,40,0.6)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="dashboard__calorie-center">
                <div className="dashboard__calorie-value" style={{ color: '#A9B887', fontSize: '1.85rem' }}>{caloriesConsumed || 520}</div>
                <div className="dashboard__calorie-label" style={{ color: '#E8E9DF', fontWeight: 600 }}>of {caloriesGoal} kcal</div>
              </div>
            </div>

            {/* Macros */}
            <div className="dashboard__macros">
              {macroData.map(m => (
                <div key={m.name} className="dashboard__macro">
                  <div className="dashboard__macro-top">
                    <span className="dashboard__macro-name" style={{ color: '#E8E9DF' }}>{m.name}</span>
                    <span className="dashboard__macro-val" style={{ color: m.color }}>{m.value}g</span>
                  </div>
                  <div className="progress-bar-container" style={{ background: 'rgba(46,61,40,0.9)' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, (m.value / m.goal) * 100)}%`, background: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(169, 184, 135, 0.2)', textAlign: 'center' }}>
              <Link to="/calculator" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A9B887', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} id="dashboard-recalc-link">
                <Flame size={13} /> Adjust Calorie & Macro Goals &rarr;
              </Link>
            </div>
          </motion.div>

          {/* ---- HYDRATION CARD (Body Water Balance) ---- */}
          <div id="hydration" className="scroll-mt-24">
            <HydrationCard />
          </div>

          {/* ---- TODAY'S MEAL PLAN ---- */}
          <motion.div className="dashboard__meal-plan card" variants={stagger.item}>
            <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-overline">Today's Meal Plan</p>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>{todayPlan?.dayName}</h3>
                </div>
                <HoverButton
                  onClick={() => navigate('/meal-plan')}
                  className="text-xs px-2.5 py-1"
                  backgroundColor="transparent"
                  textColor="#2E3D28"
                  hovertextColor="#2E3D28"
                  glowColor="#A9B887"
                  id="dashboard-view-meal-plan"
                >
                  View All <ChevronRight size={14} />
                </HoverButton>
              </div>
            </div>
            <div className="dashboard__meal-list">
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(type => {
                const meal = todayPlan?.[type];
                if (!meal) return null;
                return (
                  <div key={type} className="dashboard__meal-item">
                    <div className="dashboard__meal-image">
                      <img src={meal.imageUrl} alt={meal.name} className="img-cover" loading="lazy" />
                    </div>
                    <div className="dashboard__meal-info">
                      <p className="dashboard__meal-type">{type}</p>
                      <p className="dashboard__meal-name">{meal.name}</p>
                    </div>
                    <div className="dashboard__meal-cal">{meal.calories} kcal</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ---- RECENT ANALYSIS ---- */}
          <motion.div className="dashboard__recent card" variants={stagger.item}>
            <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-overline">Recent Analyses</p>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>Food History</h3>
                </div>
                <HoverButton
                  onClick={() => navigate('/history')}
                  className="text-xs px-2.5 py-1"
                  backgroundColor="transparent"
                  textColor="#2E3D28"
                  hovertextColor="#2E3D28"
                  glowColor="#A9B887"
                  id="dashboard-view-history"
                >
                  View All <ChevronRight size={14} />
                </HoverButton>
              </div>
            </div>

            {analysisHistory.length === 0 ? (
              <div className="dashboard__empty-state">
                <div className="dashboard__empty-icon">📸</div>
                <p className="dashboard__empty-title">Your food journey starts here.</p>
                <p className="dashboard__empty-desc">Analyze your first meal and your history will appear here.</p>
                {/* Old button kept for revert:
                <HoverButton
                  onClick={() => navigate('/analyze')}
                  className="text-sm px-5 py-2.5 font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#ffffff"
                  hoverTextColor="#ffffff"
                  id="dashboard-empty-analyze"
                >
                  Analyze Food
                </HoverButton>
                */}
                <div style={{ position: 'relative', overflow: 'visible', isolation: 'isolate', display: 'inline-block' }}>
                  <GlowButton
                    onClick={() => navigate('/analyze')}
                    id="dashboard-empty-analyze"
                    className="text-sm font-semibold"
                    label="Analyze Food"
                  />
                </div>
              </div>
            ) : (
              <div className="dashboard__history-list">
                {analysisHistory.slice(0, 4).map(a => (
                  <Link to={`/results`} key={a.id} className="dashboard__history-item" id={`history-item-${a.id}`}>
                    <img src={a.imageUrl} alt={a.foodName} className="dashboard__history-img" loading="lazy" />
                    <div className="flex-1">
                      <p className="dashboard__history-name">{a.foodName}</p>
                      <p className="dashboard__history-time">{new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="dashboard__history-cal">{a.nutrition.calories * a.currentServings} kcal</div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* ---- QUICK LINKS (Strict Sage, Walnut, Amber Tints) ---- */}
          <motion.div className="dashboard__quick-links" variants={stagger.item}>
            {[
              { to: '/weather', emoji: '🌤️', label: 'Weather & Food', desc: 'Eat right for today', color: 'rgba(46,61,40,0.9)', border: '#A9B887', id: 'quick-weather' },
              { to: '/seasonal', emoji: '🍂', label: 'Seasonal Foods', desc: 'What\'s fresh now', color: 'rgba(46,61,40,0.9)', border: '#A9B887', id: 'quick-seasonal' },
              { to: '/challenges', emoji: '🏆', label: 'Challenges', desc: 'Build healthy habits', color: 'rgba(46,61,40,0.9)', border: '#A9B887', id: 'quick-challenges' },
              { to: '/chat', emoji: '🤖', label: 'Ask AI', desc: 'Nutrition questions', color: 'rgba(46,61,40,0.9)', border: '#A9B887', id: 'quick-ai-chat' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="dashboard__quick-link" id={link.id}
                style={{ background: link.color, border: `1.5px solid ${link.border}` }}>
                <span className="dashboard__quick-link-emoji">{link.emoji}</span>
                <div>
                  <div className="dashboard__quick-link-label">{link.label}</div>
                  <div className="dashboard__quick-link-desc">{link.desc}</div>
                </div>
                <ChevronRight size={16} style={{ color: '#E8E9DF', opacity: 0.6, flexShrink: 0 }} />
              </Link>
            ))}
          </motion.div>

          {/* ---- DISCLAIMER ---- */}
          <motion.div className="dashboard__disclaimer" variants={stagger.item}>
            <span>⚕️</span>
            <p>Nutrition information is estimated and for educational purposes only. Not a substitute for professional medical or dietary advice.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

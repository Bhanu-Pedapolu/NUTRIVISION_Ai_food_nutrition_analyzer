// NutriVision — Main Application Router & Entry
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Bot, Sparkles } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FoodAnalyzerPage } from './pages/FoodAnalyzerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { WeatherFoodPage } from './pages/WeatherFoodPage';
import { SeasonalFoodsPage } from './pages/SeasonalFoodsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { GroceryPage } from './pages/GroceryPage';
import { ProfilePage } from './pages/ProfilePage';
import { QRCompanionPage } from './pages/QRCompanionPage';
import { CalorieCalculatorPage } from './pages/CalorieCalculatorPage';

function FloatingChatLauncher() {
  const location = useLocation();
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated || location.pathname === '/chat' || location.pathname === '/qr-mobile') {
    return null;
  }

  return (
    <Link to="/chat" className="floating-nutribot-btn" title="Ask NutriBot AI" id="floating-chat-btn">
      <span className="fnb-pulse-ring" />
      <span className="fnb-pulse-ring fnb-pulse-ring-2" />
      <span className="fnb-icon-wrap">
        <Bot size={22} />
      </span>
      <span className="fnb-body">
        <span className="fnb-title">Ask NutriBot</span>
        <span className="fnb-sub">AI Nutrition Assistant</span>
      </span>
      <span className="fnb-dot" />
    </Link>
  );
}

export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.removeAttribute('data-theme');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <main className="app-main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/qr-mobile" element={<QRCompanionPage />} />

            {/* Authenticated / App Routes */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<FoodAnalyzerPage />} />
            <Route path="/analyzer" element={<Navigate to="/analyze" replace />} />
            <Route path="/calculator" element={<CalorieCalculatorPage />} />
            <Route path="/calorie-calculator" element={<Navigate to="/calculator" replace />} />
            <Route path="/daily-calories" element={<Navigate to="/calculator" replace />} />
            <Route path="/meal-plan" element={<MealPlannerPage />} />
            <Route path="/planner" element={<Navigate to="/meal-plan" replace />} />
            <Route path="/tracker" element={<AnalyticsPage />} />
            <Route path="/analytics" element={<Navigate to="/tracker" replace />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/weather" element={<WeatherFoodPage />} />
            <Route path="/seasonal" element={<SeasonalFoodsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <FloatingChatLauncher />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2E3D28',
              color: '#E8E9DF',
              border: '1px solid #A9B887',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 25px rgba(46, 61, 40, 0.35)',
            },
            duration: 3500,
          }}
        />
      </div>
    </BrowserRouter>
  );
}

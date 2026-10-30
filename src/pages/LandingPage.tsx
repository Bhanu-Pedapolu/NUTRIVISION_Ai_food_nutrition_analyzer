// NutriVision — Landing Page (Strict 3-Color Palette: Sage, Walnut, Amber)
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { EntryVideoModal } from '@/components/EntryVideoModal';
import {
  Camera, Zap, CloudSun, Calendar, MessageCircle, ShoppingCart,
  ArrowRight, Star, ChevronRight, Leaf, Shield, Award, Check, Flame, Target, Sparkles, Play
} from 'lucide-react';
import './LandingPage.css';

const FEATURES = [
  {
    icon: Camera,
    emoji: '📸',
    title: 'AI Food Scanner',
    desc: 'Capture any meal and instantly understand its full nutritional profile with AI-powered image analysis.',
    color: '#A9B887',
    bg: 'rgba(46,61,40,0.9)',
    link: '/analyze',
  },
  {
    icon: Flame,
    emoji: '🔥',
    title: 'Daily Calorie Calculator',
    desc: 'Calculate precise BMR, TDEE, macro ratios, and healthy calorie targets using scientific formulas.',
    color: '#A9B887',
    bg: 'rgba(46,61,40,0.9)',
    link: '/calculator',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Personalized Nutrition',
    desc: 'Recommendations tailored to your age, goals, dietary preferences, and health conditions.',
    color: '#A9B887',
    bg: 'rgba(46,61,40,0.9)',
  },
  {
    icon: CloudSun,
    emoji: '🌤️',
    title: 'Weather-Aware Foods',
    desc: 'Get food suggestions optimized for today\'s weather — hot days, cold evenings, or rainy afternoons.',
    color: '#E8E9DF',
    bg: '#f2ebe5',
  },
  {
    icon: Calendar,
    emoji: '📅',
    title: 'Smart Meal Plans',
    desc: 'Personalized weekly meal plans that align with your nutrition goals and food preferences.',
    color: '#A9B887',
    bg: 'rgba(46,61,40,0.9)',
  },
  {
    icon: MessageCircle,
    emoji: '🤖',
    title: 'AI Nutrition Assistant',
    desc: 'Ask anything about your food, get instant answers, and discover healthier alternatives.',
    color: '#A9B887',
    bg: 'rgba(46,61,40,0.9)',
  },
  {
    icon: ShoppingCart,
    emoji: '🛒',
    title: 'Smart Grocery List',
    desc: 'Automatically generate shopping lists from your meal plans with intelligent categorization.',
    color: '#E8E9DF',
    bg: '#f2ebe5',
  },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Fitness Enthusiast', text: 'NutriVision changed how I think about food. The AI analysis is incredibly accurate and the meal plans are easy to follow.', avatar: 'P', rating: 5 },
  { name: 'Rahul Mehta', role: 'Software Engineer', text: 'The QR phone workflow is genius! I take photos with my phone and immediately see nutrition data on my laptop.', avatar: 'R', rating: 5 },
  { name: 'Anjali Patel', role: 'Nutritionist', text: 'As a professional nutritionist, I recommend NutriVision to clients who want to understand their food better without judgment.', avatar: 'A', rating: 5 },
];

const STATS = [
  { value: '50K+', label: 'Foods Analyzed', emoji: '🍽️' },
  { value: '98%', label: 'Accuracy Rate', emoji: '🎯' },
  { value: '10K+', label: 'Active Users', emoji: '👥' },
  { value: '4.9★', label: 'User Rating', emoji: '⭐' },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Play entry video at the beginning of website visit
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('nutrivision_intro_played');
    if (!hasSeenIntro) {
      setShowVideoModal(true);
      sessionStorage.setItem('nutrivision_intro_played', 'true');
    }
  }, []);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__bg-orbs" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>

        <div className="container hero__container">
          {/* Left Content */}
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="hero__pill"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="hero__pill-dot" />
              <Leaf size={14} color="#A9B887" />
              <span>AI-Powered Nutrition Intelligence</span>
            </motion.div>

            {/* Large Bold Hero Heading with one key word in italic Amber Glow */}
            <h1 className="hero__heading" id="hero-heading">
              <span className="hero__heading-line">Understand</span>
              <span className="hero__heading-line hero__heading-line--accent">
                <em>What's On</em>
              </span>
              <span className="hero__heading-line">Your Plate.</span>
            </h1>

            <motion.p
              className="hero__subheading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Powered by AI. Personalized for You.
            </motion.p>

            <motion.p
              className="hero__desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Capture your food, discover its complete nutritional profile, and receive personalized insights calibrated to your metabolic goals.
            </motion.p>

            {/* Hero Action Buttons: Primary Amber + Outlined Walnut border */}
            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <HoverButton
                onClick={() => setShowVideoModal(true)}
                className="text-base px-7 py-3.5 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                textColor="#ffffff"
                hoverTextColor="#ffffff"
                id="hero-cta-primary"
              >
                <Camera size={18} aria-hidden="true" />
                Analyze Your Food
              </HoverButton>

              <HoverButton
                href="/calculator"
                className="text-base px-6 py-3.5 font-semibold"
                backgroundColor="#A9B887"
                textColor="#2E3D28"
                hoverTextColor="#2E3D28"
                glowColor="#A9B887"
                id="hero-cta-calculator"
              >
                <Flame size={18} aria-hidden="true" />
                Calorie Calculator
              </HoverButton>

              <HoverButton
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base px-7 py-3.5 font-semibold"
                backgroundColor="transparent"
                textColor="#2E3D28"
                hovertextColor="#2E3D28"
                glowColor="rgba(169, 184, 135, 0.3)"
                style={{ border: '2px solid #A9B887' }}
                id="hero-cta-secondary"
              >
                Explore Features
                <ArrowRight size={16} aria-hidden="true" />
              </HoverButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="hero__trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="hero__trust-avatars" aria-hidden="true">
                {['P', 'R', 'A', 'S', 'M'].map((letter, i) => (
                  <div key={i} className="hero__trust-avatar" style={{ zIndex: 5 - i }}>{letter}</div>
                ))}
              </div>
              <p className="hero__trust-text">
                <strong>10,000+</strong> mindful eaters improving nutrition daily
              </p>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, x: 32, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div className="hero__food-container">
              {/* Main food image */}
              <div className="hero__food-image-wrapper">
                <img
                  src="/hero-food.jpg"
                  alt="Fresh wholesome nutrition plate"
                  className="hero__food-image img-cover"
                  loading="eager"
                />
                {/* AI Scan overlay */}
                <div className="hero__scan-overlay">
                  <div className="hero__scan-corner hero__scan-corner--tl" />
                  <div className="hero__scan-corner hero__scan-corner--tr" />
                  <div className="hero__scan-corner hero__scan-corner--bl" />
                  <div className="hero__scan-corner hero__scan-corner--br" />
                  <div className="hero__scan-line" />
                </div>
              </div>

              {/* Floating nutrition cards in Amber and Sage */}
              <motion.div
                className="hero__float-card hero__float-card--protein"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="hero__float-card-icon">⚡</span>
                <div>
                  <div className="hero__float-card-value">28g</div>
                  <div className="hero__float-card-label">Protein</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--fiber"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="hero__float-card-icon">🌿</span>
                <div>
                  <div className="hero__float-card-value">8g</div>
                  <div className="hero__float-card-label">Fiber</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--calories"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <span className="hero__float-card-icon">🔥</span>
                <div>
                  <div className="hero__float-card-value">520</div>
                  <div className="hero__float-card-label">kcal</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--vitamin"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <span className="hero__float-card-icon">🌾</span>
                <div>
                  <div className="hero__float-card-value">100%</div>
                  <div className="hero__float-card-label">Vit. C</div>
                </div>
              </motion.div>

              {/* AI badge */}
              <div className="hero__ai-badge">
                <div className="hero__ai-badge-pulse" />
                <span>🤖</span>
                <span>AI Vision Calibrated</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          <div className="container">
            <div className="hero__stats-grid">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="hero__stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                >
                  <span className="hero__stat-emoji" aria-hidden="true">{stat.emoji}</span>
                  <div>
                    <div className="hero__stat-value">{stat.value}</div>
                    <div className="hero__stat-label">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section: Your Food Has A Story */}
      <section className="editorial-section" aria-labelledby="story-heading">
        <div className="container">
          <div className="editorial-section__inner">
            <FadeIn className="editorial-section__image-side">
              <div className="editorial-section__image-frame">
                <img src="/salad-bowl.jpg" alt="Beautiful Buddha bowl with quinoa, avocado, and fresh vegetables" className="img-cover" loading="lazy" />
                <div className="editorial-section__image-badge">
                  <span>🌿</span>
                  <span>480 kcal · High Satiety · Plant Powered</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="editorial-section__text-side">
              <p className="label-overline">The NutriVision Difference</p>
              <h2 id="story-heading" className="editorial-section__heading">
                Your Food Has<br />
                <em>A Story.</em>
              </h2>
              <p className="editorial-section__body">
                Every meal tells a story of micronutrients, macro ratios, and digestive impact. NutriVision uses state-of-the-art vision models to read that story in seconds so you can eat in harmony with your natural rhythm.
              </p>
              <p className="editorial-section__body">
                From a single snapshot to a holistic nutritional breakdown: Protein quality, Glycemic load, Vitamin density, and Allergen sensitivity — all presented with clarity and calm.
              </p>
              <HoverButton
                onClick={() => navigate('/register')}
                className="text-base px-6 py-3 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                id="editorial-cta"
              >
                Begin Your Journey <ArrowRight size={16} />
              </HoverButton>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Flow Section: From Photo to Profile */}
      <section className="flow-section" aria-labelledby="flow-heading">
        <div className="container">
          <FadeIn>
            <div className="flow-section__header">
              <p className="label-overline">Seamless Workflow</p>
              <h2 id="flow-heading" className="flow-section__heading">
                From A Photo To A<br />Complete Profile.
              </h2>
              <p className="flow-section__subtext">
                Four effortless steps to total nutritional clarity.
              </p>
            </div>
          </FadeIn>

          <div className="flow-steps">
            {[
              { step: '01', emoji: '📸', title: 'Capture Food', desc: 'Snap a photo on phone or laptop camera, or drop an image from your gallery.', color: '#A9B887' },
              { step: '02', emoji: '🤖', title: 'AI Detection', desc: 'Google Gemini Vision identifies distinct dishes, portion sizes, and ingredients.', color: '#A9B887' },
              { step: '03', emoji: '📊', title: 'Macro Breakdown', desc: 'Instant breakdown of protein, complex carbs, healthy fats, and micronutrients.', color: '#E8E9DF' },
              { step: '04', emoji: '✨', title: 'Personalized Insights', desc: 'Custom feedback matched to your specific lifestyle targets and diet style.', color: '#A9B887' },
            ].map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.15} className="flow-step">
                <div className="flow-step__number" style={{ color: step.color }}>{step.step}</div>
                <div className="flow-step__icon" style={{ background: `${step.color}18`, color: step.color }}>
                  {step.emoji}
                </div>
                <h3 className="flow-step__title">{step.title}</h3>
                <p className="flow-step__desc">{step.desc}</p>
                {i < 3 && <div className="flow-step__arrow" aria-hidden="true"><ChevronRight size={20} /></div>}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features" aria-labelledby="features-heading">
        <div className="container">
          <FadeIn>
            <div className="features-section__header">
              <p className="label-overline">Core Capabilities</p>
              <h2 id="features-heading" className="features-section__heading">
                Everything You Need<br />To Eat Smarter.
              </h2>
              <p className="features-section__subtext">
                A natural, mindful nutrition platform built for lasting well-being.
              </p>
            </div>
          </FadeIn>

          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.08} className="feature-card">
                <div className="feature-card__icon" style={{ background: feature.bg, color: feature.color }}>
                  <span className="feature-card__emoji" aria-hidden="true">{feature.emoji}</span>
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.desc}</p>
                <Link to={(feature as any).link || "/register"} className="feature-card__link">
                  Explore <ArrowRight size={14} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WEIGHT LOSS & WEIGHT GAIN PLAN CARDS (Component Requirement #6) */}
      <section className="plans-section" id="plans" aria-labelledby="plans-heading">
        <div className="container">
          <FadeIn>
            <div className="plans-section__header">
              <p className="label-overline">Targeted Nutrition Protocols</p>
              <h2 id="plans-heading" className="plans-section__heading">
                Tailored For <em>Your</em> Goal
              </h2>
              <p className="plans-section__subtext">
                Whether leaning down or building strength, our AI calibrates daily protein and caloric targets to your biology.
              </p>
            </div>
          </FadeIn>

          <div className="plans-grid">
            {/* 1. Weight Loss Plan Card (Sage-Accented) */}
            <FadeIn delay={0.1} className="plan-card plan-card--loss">
              <div className="plan-card__header">
                <span className="plan-card__badge">
                  <Leaf size={14} /> Weight Loss Protocol
                </span>
                <h3 className="plan-card__title">Lean & Defined</h3>
                <p className="plan-card__desc">
                  Optimized for safe fat reduction, sustained energy, and hunger suppression through high protein and thermogenic foods.
                </p>
              </div>

              {/* Data points: Daily Protein Needed & Calories to Burn */}
              <div className="plan-metrics-row">
                <div className="plan-metric__box">
                  <span className="plan-metric__label">Daily Protein Needed</span>
                  <span className="plan-metric__val">105g</span>
                  <span className="plan-metric__sub">1.6g / kg body mass</span>
                </div>
                <div className="plan-metric__box">
                  <span className="plan-metric__label">Calories To Burn</span>
                  <span className="plan-metric__val">500 kcal</span>
                  <span className="plan-metric__sub">Daily targeted deficit</span>
                </div>
              </div>

              {/* Short data points with icons */}
              <div className="plan-points-list">
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>High Satiety & Dietary Fiber Index</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Preserves Lean Skeletal Muscle Mass</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Thermogenic Whole-Lentil & Green Meals</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Automated Weekly Deficit Tracker</span>
                </div>
              </div>

              <div className="plan-card__action">
                <HoverButton
                  onClick={() => navigate('/register')}
                  className="w-full text-base py-3.5 font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#ffffff"
                  hoverTextColor="#ffffff"
                  id="select-plan-weight-loss"
                >
                  <Target size={16} /> Select Plan
                </HoverButton>
              </div>
            </FadeIn>

            {/* 2. Weight Gain Plan Card (Amber-Accented) */}
            <FadeIn delay={0.2} className="plan-card plan-card--gain">
              <div className="plan-card__header">
                <span className="plan-card__badge">
                  <Sparkles size={14} /> Weight Gain Protocol
                </span>
                <h3 className="plan-card__title">Hypertrophy & Mass</h3>
                <p className="plan-card__desc">
                  Structured caloric surplus to pack on functional muscle mass with clean complex carbs and dense micronutrient support.
                </p>
              </div>

              {/* Data points: Daily Protein Needed & Calories to Burn / Surplus */}
              <div className="plan-metrics-row">
                <div className="plan-metric__box">
                  <span className="plan-metric__label">Daily Protein Needed</span>
                  <span className="plan-metric__val">145g</span>
                  <span className="plan-metric__sub">2.0g / kg body mass</span>
                </div>
                <div className="plan-metric__box">
                  <span className="plan-metric__label">Calories To Burn</span>
                  <span className="plan-metric__val">400 kcal</span>
                  <span className="plan-metric__sub">Caloric surplus surplus</span>
                </div>
              </div>

              {/* Short data points with icons */}
              <div className="plan-points-list">
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Fast Glycogen & Cellular Recovery</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>High-Protein Superfood Combinations</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Digestive Enzyme-Rich Whole Foods</span>
                </div>
                <div className="plan-point-item">
                  <div className="plan-point-icon"><Check size={14} /></div>
                  <span>Surplus Consistency & Strength Log</span>
                </div>
              </div>

              <div className="plan-card__action">
                <HoverButton
                  onClick={() => navigate('/register')}
                  className="w-full text-base py-3.5 font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#ffffff"
                  hoverTextColor="#ffffff"
                  id="select-plan-weight-gain"
                >
                  <Flame size={16} /> Select Plan
                </HoverButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* QR Highlight Section */}
      <section className="qr-highlight" aria-labelledby="qr-heading">
        <div className="container">
          <div className="qr-highlight__inner">
            <FadeIn className="qr-highlight__text">
              <p className="label-overline" style={{ color: '#A9B887' }}>Phone to Laptop Sync</p>
              <h2 id="qr-heading" className="qr-highlight__heading">
                Snap From Phone.<br />Analyze on Screen.
              </h2>
              <p className="qr-highlight__body">
                Sit down at your dining table, scan the QR code with your phone camera, and take a photo. It instantly beams to your laptop dashboard for full-screen nutritional analysis.
              </p>
              <div className="qr-highlight__steps">
                {['Scan QR code', 'Take meal photo', 'Instant sync', 'Explore nutrients'].map((s, i) => (
                  <div key={s} className="qr-highlight__step">
                    <div className="qr-highlight__step-num">{i + 1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <HoverButton
                onClick={() => navigate('/register')}
                className="text-base px-7 py-3.5 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                textColor="#ffffff"
                hoverTextColor="#ffffff"
                id="qr-cta"
              >
                Try Mobile Sync <ArrowRight size={16} />
              </HoverButton>
            </FadeIn>

            <FadeIn delay={0.3} className="qr-highlight__visual">
              <div className="qr-highlight__phone" aria-hidden="true">
                <div className="qr-highlight__phone-screen">
                  <img src="/hero-food.jpg" alt="" className="img-cover" loading="lazy" />
                  <div className="qr-highlight__scan-frame" />
                  <div className="qr-highlight__success">
                    <Check size={16} />
                    <span>Photo Synced!</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <div className="container">
          <FadeIn>
            <div className="testimonials-section__header">
              <p className="label-overline">Community Trust</p>
              <h2 id="testimonials-heading" className="testimonials-section__heading">
                Loved by Wellness Seekers
              </h2>
            </div>
          </FadeIn>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1} className="testimonial-card">
                <div className="testimonial-card__stars" aria-label={`${t.rating} stars`}>
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} size={15} fill="#A9B887" color="#A9B887" />
                  ))}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__role">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" aria-labelledby="cta-heading">
        <div className="container">
          <FadeIn className="landing-cta__inner">
            <div className="landing-cta__badge">
              <Award size={18} /> Premium Wellness · Free to Start
            </div>
            <h2 id="cta-heading" className="landing-cta__heading">
              Start Understanding<br />Your Food Today.
            </h2>
            <p className="landing-cta__body">
              Join thousands eating with intentionality and joy. No credit card required.
            </p>
            <div className="landing-cta__actions">
              <HoverButton
                onClick={() => navigate('/register')}
                className="text-base px-8 py-4 font-semibold"
                backgroundColor="#A9B887"
                glowColor="#A9B887"
                textColor="#ffffff"
                hoverTextColor="#ffffff"
                id="footer-cta-primary"
              >
                <Camera size={18} /> Create Free Account
              </HoverButton>
              <HoverButton
                onClick={() => navigate('/login')}
                className="text-base px-8 py-4 font-semibold"
                backgroundColor="transparent"
                textColor="#2E3D28"
                hovertextColor="#2E3D28"
                glowColor="rgba(169, 184, 135, 0.3)"
                style={{ border: '2px solid #A9B887' }}
                id="footer-cta-login"
              >
                Sign In <ArrowRight size={16} />
              </HoverButton>
            </div>
            <p className="landing-cta__disclaimer">
              <Shield size={14} color="#A9B887" /> Your health data is private and encrypted.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer (Walnut Brown Background, Sage Links, Amber Hover) */}
      <footer className="landing-footer" role="contentinfo">
        <div className="container">
          <div className="landing-footer__inner">
            <div className="landing-footer__brand">
              <div className="landing-footer__logo">
                <Leaf size={22} />
                NutriVision
              </div>
              <p className="landing-footer__tagline">See Your Food. Understand Your Nutrition.</p>
              <p className="landing-footer__disclaimer">
                Nutrition estimates are for educational guidance and wellness optimization. Not a substitute for formal medical advice.
              </p>
            </div>

            <div className="landing-footer__links">
              <div>
                <h4>Explore</h4>
                <Link to="/register">Get Started</Link>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Meal Planner</Link>
                <Link to="/register">AI Assistant</Link>
              </div>
              <div>
                <h4>Protocols</h4>
                <a href="#plans">Weight Loss Plan</a>
                <a href="#plans">Weight Gain Plan</a>
                <Link to="/register">Seasonal Guide</Link>
              </div>
              <div>
                <h4>Company</h4>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/privacy">Terms of Service</Link>
                <Link to="/privacy">Data Ethics</Link>
              </div>
            </div>
          </div>
          <div className="landing-footer__bottom">
            <p>© 2026 NutriVision. Handcrafted with warm, natural wellness design principles.</p>
          </div>
        </div>
      </footer>

      {/* Entry Video Modal Player */}
      <EntryVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        targetPath="/dashboard"
      />
    </div>
  );
}

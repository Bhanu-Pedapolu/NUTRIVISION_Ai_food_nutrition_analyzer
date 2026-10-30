// NutriVision — Nutrition Challenges Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Trophy, CheckCircle2, Flame, Droplets, Leaf,
  Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { CHALLENGES } from '../data/demoData';
import './ChallengesPage.css';

export function ChallengesPage() {
  const [activeChallenges, setActiveChallenges] = useState<Record<string, number>>({
    c1: 4, // 4 days of 7
    c2: 2, // 2 days of 7
  });

  const handleJoinChallenge = (id: string, title: string) => {
    if (activeChallenges[id] !== undefined) {
      toast('Challenge already in progress! Keep up the streak.', { icon: '🔥' });
      return;
    }
    setActiveChallenges(prev => ({ ...prev, [id]: 1 }));
    toast.success(`Joined ${title}! Day 1 active.`, { icon: '🏆' });
  };

  const handleIncrementStreak = (id: string, maxDays: number) => {
    setActiveChallenges(prev => {
      const current = prev[id] || 0;
      if (current >= maxDays) {
        toast.success('Congratulations! Challenge Completed & Badge Earned! 🏅', { icon: '🎉' });
        return prev;
      }
      toast.success(`Logged Day ${current + 1} progress!`);
      return { ...prev, [id]: current + 1 };
    });
  };

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <div className="container">
          <span className="badge badge-accent">
            <Trophy size={14} /> Behavioral Health Habits
          </span>
          <h1 className="challenges-title">Nutrition & Wellness Challenges</h1>
          <p className="challenges-subtitle">
            Micro-habits backed by behavioral science. Build consistency, hit nutrient thresholds, and earn verifiable wellness badges.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="challenges-grid">
          {CHALLENGES.map((ch) => {
            const currentDay = activeChallenges[ch.id];
            const isJoined = currentDay !== undefined;
            const isCompleted = isJoined && currentDay >= ch.durationDays;
            const progressPct = isJoined ? Math.min(100, Math.round((currentDay / ch.durationDays) * 100)) : 0;

            return (
              <div key={ch.id} className={`challenge-card ${isJoined ? 'active' : ''}`}>
                <div className="challenge-icon-row">
                  <span className="challenge-emoji">{ch.icon}</span>
                  {isCompleted ? (
                    <span className="badge badge-accent">
                      <CheckCircle2 size={12} /> Badge Earned
                    </span>
                  ) : isJoined ? (
                    <span className="badge badge-neutral">In Progress</span>
                  ) : (
                    <span className="badge badge-neutral">{ch.durationDays} Days</span>
                  )}
                </div>

                <h3>{ch.title}</h3>
                <p className="challenge-desc">{ch.description}</p>

                {isJoined && (
                  <div className="challenge-progress-box">
                    <div className="progress-labels">
                      <span>Day {currentDay} of {ch.durationDays}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="challenge-action-row">
                  {isJoined ? (
                    <HoverButton
                      className="text-xs px-3.5 py-1.5 font-semibold"
                      backgroundColor={isCompleted ? '#10b981' : '#2d6a4f'}
                      glowColor={isCompleted ? '#34d399' : '#52b788'}
                      textColor="#ffffff"
                      hoverTextColor="#ffffff"
                      onClick={() => handleIncrementStreak(ch.id, ch.durationDays)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? 'Completed 🎉' : "Log Today's Habit +1"}
                    </HoverButton>
                  ) : (
                    <HoverButton
                      className="text-xs px-3.5 py-1.5 font-semibold"
                      backgroundColor="rgba(45, 106, 79, 0.12)"
                      textColor="#2d6a4f"
                      hoverTextColor="#1b4332"
                      glowColor="#52b788"
                      onClick={() => handleJoinChallenge(ch.id, ch.title)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Accept Challenge <ArrowRight size={14} />
                      </span>
                    </HoverButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

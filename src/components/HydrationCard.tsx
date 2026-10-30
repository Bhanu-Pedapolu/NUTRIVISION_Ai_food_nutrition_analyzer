// NutriVision — Body Water Balance Hydration Card Component
// Palette: Soft White (#E8E9DF), Sage Green (#A9B887), Deep Olive (#2E3D28)

import React, { useState, useEffect, useId, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Plus, Minus, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { getTodayHydration, saveTodayHydration, getLocalDateKey } from '../utils/hydrationStorage';
import './HydrationCard.css';

// Precise symmetrical human body silhouette path (viewBox: 0 0 120 290)
// Head top: y=12, Bottom of feet: y=280 -> height span = 268 units
const BODY_SILHOUETTE_PATH =
  'M 60 12 ' +
  'C 52 12, 44 20, 44 30 ' +
  'C 44 40, 50 48, 52 53 ' +
  'C 45 56, 34 60, 26 69 ' +
  'C 21 74, 20 86, 19 104 ' +
  'C 18 118, 17 135, 17 152 ' +
  'C 17 160, 16 172, 19 178 ' +
  'C 21 182, 24 180, 25 173 ' +
  'C 26 167, 24 156, 25 145 ' +
  'C 26 130, 28 105, 30 92 ' +
  'C 32 105, 33 118, 34 128 ' +
  'C 35 137, 33 147, 32 158 ' +
  'C 31 168, 33 188, 34 202 ' +
  'C 35 212, 32 224, 33 238 ' +
  'C 34 248, 37 258, 38 265 ' +
  'C 38 270, 32 272, 26 274 ' +
  'C 24 275, 24 278, 28 279 ' +
  'C 34 280, 44 280, 47 278 ' +
  'C 49 276, 46 268, 45 262 ' +
  'C 44 252, 45 236, 44 220 ' +
  'C 43 205, 45 185, 48 168 ' +
  'C 52 155, 57 148, 60 148 ' +
  // Mirrored right half
  'C 63 148, 68 155, 72 168 ' +
  'C 75 185, 77 205, 76 220 ' +
  'C 75 236, 76 252, 75 262 ' +
  'C 74 268, 71 276, 73 278 ' +
  'C 76 280, 86 280, 92 279 ' +
  'C 96 278, 96 275, 94 274 ' +
  'C 88 272, 82 270, 82 265 ' +
  'C 83 258, 86 248, 87 238 ' +
  'C 88 224, 85 212, 86 202 ' +
  'C 87 188, 89 168, 88 158 ' +
  'C 87 147, 85 137, 86 128 ' +
  'C 87 118, 88 105, 90 92 ' +
  'C 92 105, 94 130, 95 145 ' +
  'C 96 156, 94 167, 95 173 ' +
  'C 96 180, 99 182, 101 178 ' +
  'C 104 172, 103 160, 103 152 ' +
  'C 103 135, 102 118, 101 104 ' +
  'C 100 86, 99 74, 94 69 ' +
  'C 86 60, 75 56, 68 53 ' +
  'C 70 48, 76 40, 76 30 ' +
  'C 76 20, 68 12, 60 12 Z';

interface HydrationCardProps {
  className?: string;
}

export function HydrationCard({ className = '' }: HydrationCardProps) {
  const navigate = useNavigate();
  const clipId = useId();
  const { profile, hydrationLog, addHydration: storeAddHydration } = useAppStore();

  // Dynamic Goal: Default 2.5L (2500ml), or dynamic based on weight ~35ml per kg
  const dynamicGoal = profile?.weightKg
    ? Math.max(1500, Math.round((profile.weightKg * 35) / 50) * 50)
    : 2500;

  // Number of glasses: baseline 8 glasses (2L), or goal / 250 rounded up
  const totalGlasses = Math.max(8, Math.ceil(dynamicGoal / 250));

  // Intake state with persistent localStorage and automatic midnight reset
  const [totalMl, setTotalMl] = useState<number>(() => {
    const stored = getTodayHydration(dynamicGoal);
    return stored.totalMl;
  });

  const [currentDateKey, setCurrentDateKey] = useState<string>(getLocalDateKey());

  // Sync state if store updates from elsewhere (e.g., food analyzer adding water)
  useEffect(() => {
    if (hydrationLog?.totalMl !== undefined && Math.abs(hydrationLog.totalMl - totalMl) > 0) {
      setTotalMl(hydrationLog.totalMl);
      saveTodayHydration(hydrationLog.totalMl, dynamicGoal);
    }
  }, [hydrationLog?.totalMl]);

  // Automatic midnight reset check
  useEffect(() => {
    const checkMidnight = () => {
      const today = getLocalDateKey();
      if (today !== currentDateKey) {
        setCurrentDateKey(today);
        const fresh = getTodayHydration(dynamicGoal);
        setTotalMl(fresh.totalMl);
      }
    };

    const interval = setInterval(checkMidnight, 30000); // Check every 30 seconds
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkMidnight();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [currentDateKey, dynamicGoal]);

  // Save changes locally and sync with global store
  const updateIntake = useCallback(
    (newMl: number, toastMessage?: string) => {
      const clamped = Math.max(0, newMl);
      setTotalMl(clamped);
      saveTodayHydration(clamped, dynamicGoal);

      // Keep Zustand store in sync
      const delta = clamped - (hydrationLog?.totalMl || 0);
      if (delta !== 0) {
        storeAddHydration(delta);
      }

      if (toastMessage) {
        toast.success(toastMessage, { icon: '💧', duration: 2500 });
      }
    },
    [dynamicGoal, hydrationLog?.totalMl, storeAddHydration]
  );

  const handleAdd = (amount: number) => {
    const newTotal = totalMl + amount;
    const reachedGoal = totalMl < dynamicGoal && newTotal >= dynamicGoal;
    updateIntake(newTotal, reachedGoal ? 'Daily hydration goal reached! 🎉' : `+${amount}ml logged`);
  };

  const handleUndo = () => {
    if (totalMl <= 0) return;
    const newTotal = Math.max(0, totalMl - 250);
    updateIntake(newTotal, '−250ml (Undo)');
  };

  // Direct glass click: Fill or unfill up to that glass index
  const handleGlassClick = (glassIndex: number) => {
    const glassTargetMl = (glassIndex + 1) * 250;
    if (totalMl >= glassTargetMl) {
      // If already at or past this glass, unfill back to the previous glass
      const prevTarget = glassIndex * 250;
      updateIntake(prevTarget, `Updated to ${(prevTarget / 1000).toFixed(2)}L`);
    } else {
      // Fill up to this glass
      updateIntake(glassTargetMl, `Logged to ${(glassTargetMl / 1000).toFixed(2)}L`);
    }
  };

  // Calculations for body water height
  // Feet at y=280, head top at y=12 -> span is 268 units
  const fillRatio = Math.min(1, totalMl / dynamicGoal);
  const waterHeight = fillRatio * 268;
  const waterY = 280 - waterHeight; // Top of the water surface
  const percentage = Math.round((totalMl / dynamicGoal) * 100);
  const isGoalReached = totalMl >= dynamicGoal;

  return (
    <div
      className={`body-water-card ${className}`}
      role="region"
      aria-label="Hydration and Body Water Balance Tracker"
    >
      {/* Top Header Row */}
      <div className="bwc__header">
        <div className="bwc__header-info">
          <div className="bwc__badge-row">
            <span className="bwc__overline">
              <Droplets size={14} className="bwc__droplet-icon" />
              Body Water Balance
            </span>
            {isGoalReached && (
              <span className="bwc__goal-reached-badge">
                <CheckCircle2 size={12} /> Goal reached 🎉
              </span>
            )}
          </div>

          <div className="bwc__value-row">
            <span className="bwc__current-liters">
              {(totalMl / 1000).toFixed(totalMl % 1000 === 0 ? 1 : 2)}L
            </span>
            <span className="bwc__goal-sub">
              Goal: {(dynamicGoal / 1000).toFixed(1)}L • {percentage}%
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/tracker')}
          className="bwc__view-tracker-btn"
          aria-label="View Hydration Tracker History"
        >
          <span>View Tracker</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main Interactive Visual Section: Body Silhouette + 8 Glasses Grid */}
      <div className="bwc__visual-container">
        {/* Left: Human Body Silhouette with Wave Water Surface */}
        <div className="bwc__body-silhouette-wrapper">
          <svg
            viewBox="0 0 120 290"
            className="bwc__body-svg"
            role="img"
            aria-label={`Human body silhouette filled ${percentage}% with water`}
          >
            <defs>
              <clipPath id={`body-clip-${clipId}`}>
                <path d={BODY_SILHOUETTE_PATH} />
              </clipPath>
            </defs>

            {/* Unfilled Silhouette Background Tint */}
            <path
              d={BODY_SILHOUETTE_PATH}
              className="bwc__body-unfilled"
            />

            {/* Rising Water with Animated Wave Surface */}
            {totalMl > 0 && (
              <g clipPath={`url(#body-clip-${clipId})`}>
                <g
                  className="bwc__water-group"
                  style={{
                    transform: `translateY(${waterY}px)`,
                    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Looping Smooth Animated Wave on Water Surface */}
                  <path
                    className="bwc__wave-path"
                    d="M -120 0 Q -90 -4.5 -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0 V 300 H -120 Z"
                  />
                  {/* Under-Wave Water Body Fill */}
                  <rect
                    x="-60"
                    y="0"
                    width="240"
                    height="320"
                    className="bwc__water-rect"
                  />
                </g>
              </g>
            )}

            {/* Subtle Outer Silhouette Contour */}
            <path
              d={BODY_SILHOUETTE_PATH}
              className="bwc__body-outline"
            />

            {/* H2O Emblem across Chest */}
            <text
              x="60"
              y="112"
              className="bwc__h2o-text"
              aria-hidden="true"
            >
              H2O
            </text>
          </svg>
        </div>

        {/* Right: Glasses Grid (2 Columns) */}
        <div className="bwc__glasses-section">
          <div
            className="bwc__glasses-grid"
            role="group"
            aria-label={`${totalGlasses} daily water glasses`}
          >
            {Array.from({ length: totalGlasses }).map((_, index) => {
              const glassMinMl = index * 250;
              const glassMaxMl = (index + 1) * 250;
              const isFirst = index === 0;

              // Fraction filled for this individual glass (0.0 to 1.0)
              let glassFillFraction = 0;
              if (totalMl >= glassMaxMl) {
                glassFillFraction = 1;
              } else if (totalMl > glassMinMl) {
                glassFillFraction = (totalMl - glassMinMl) / 250;
              }

              // Visual state
              const isFull = glassFillFraction >= 1;
              const isPartial = glassFillFraction > 0 && glassFillFraction < 1;
              const isEmpty = glassFillFraction === 0;

              // Height of water in glass (usable height inside glass is ~34px, from y=40 to y=6)
              const fillHeight = 34 * glassFillFraction;
              const fillY = 40 - fillHeight;
              const meniscusRx = 8 + glassFillFraction * 3;

              return (
                <button
                  key={index}
                  type="button"
                  className={`bwc__glass-btn ${isFull ? 'bwc__glass-btn--full' : ''} ${
                    isPartial ? 'bwc__glass-btn--partial' : ''
                  } ${isEmpty ? 'bwc__glass-btn--empty' : ''}`}
                  onClick={() => handleGlassClick(index)}
                  title={`Glass ${index + 1}: 250 ml (${
                    isFull ? 'Filled' : isPartial ? `${Math.round(glassFillFraction * 250)}ml` : 'Empty'
                  }) — Click to toggle`}
                  aria-label={`Glass ${index + 1}: 250 ml ${
                    isFull ? 'fully drank' : isPartial ? 'partially drank' : 'empty'
                  }`}
                >
                  <svg
                    viewBox="0 0 36 46"
                    className="bwc__glass-svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <clipPath id={`glass-clip-${clipId}-${index}`}>
                        {/* Tapered inner cup contour */}
                        <path d="M 6 6 L 9.5 40 Q 18 43 26.5 40 L 30 6 Z" />
                      </clipPath>
                    </defs>

                    {/* Faint Cup Interior Tint */}
                    <path
                      d="M 5 6 L 9 40 Q 18 43 27 40 L 31 6 Z"
                      className="bwc__glass-inner-tint"
                    />

                    {/* Water Level inside Glass */}
                    {glassFillFraction > 0 && (
                      <g clipPath={`url(#glass-clip-${clipId}-${index})`}>
                        <rect
                          x="0"
                          y={fillY}
                          width="36"
                          height="46"
                          className="bwc__glass-water-fill"
                        />
                        {/* Surface Ellipse Meniscus */}
                        <ellipse
                          cx="18"
                          cy={fillY}
                          rx={meniscusRx}
                          ry="2.2"
                          className="bwc__glass-meniscus"
                        />
                      </g>
                    )}

                    {/* Glass Outer Rim & Wall Strokes */}
                    <path
                      d="M 5 6 L 9 40 Q 18 43 27 40 L 31 6"
                      className="bwc__glass-walls"
                    />
                    <ellipse
                      cx="18"
                      cy="6"
                      rx="13"
                      ry="3"
                      className="bwc__glass-rim"
                    />

                    {/* Base Curve Highlight */}
                    <path
                      d="M 11 40 Q 18 42 25 40"
                      className="bwc__glass-base"
                    />

                    {/* First Glass "250 ml" Label */}
                    {isFirst && (
                      <text
                        x="18"
                        y="23"
                        className="bwc__first-glass-label"
                      >
                        250 ml
                      </text>
                    )}
                  </svg>
                </button>
              );
            })}
          </div>

          <p className="bwc__glasses-caption">
            {totalGlasses} glasses per day
          </p>
        </div>
      </div>

      {/* Action Buttons Row: +250ml, +500ml, Undo/-250ml */}
      <div className="bwc__actions-row">
        <button
          type="button"
          onClick={() => handleAdd(250)}
          className="bwc__action-btn bwc__action-btn--primary"
          aria-label="Add 250 milliliters of water"
          id="hydration-btn-add-250"
        >
          <Plus size={14} />
          <span>+250 ml</span>
        </button>

        <button
          type="button"
          onClick={() => handleAdd(500)}
          className="bwc__action-btn bwc__action-btn--primary"
          aria-label="Add 500 milliliters of water"
          id="hydration-btn-add-500"
        >
          <Plus size={14} />
          <span>+500 ml</span>
        </button>

        <button
          type="button"
          onClick={handleUndo}
          disabled={totalMl <= 0}
          className="bwc__action-btn bwc__action-btn--undo"
          aria-label="Undo 250 milliliters"
          title="Undo last 250 ml"
          id="hydration-btn-undo"
        >
          <RotateCcw size={13} />
          <span>−250 ml</span>
        </button>
      </div>
    </div>
  );
}
export default HydrationCard;

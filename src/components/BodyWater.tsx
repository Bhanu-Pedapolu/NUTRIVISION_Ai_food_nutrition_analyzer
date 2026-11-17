"use client";

import React, { useRef, useEffect, useCallback } from 'react';

// Symmetrical human body silhouette path (viewBox: 0 0 120 290)
// Head top: y=12, Bottom of feet: y=280 -> height span = 268 units
const BODY_PATH_D =
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

const VIEW_W = 120;
const VIEW_H = 290;
const HEAD_Y = 12;
const FEET_Y = 280;
const SPAN_Y = FEET_Y - HEAD_Y; // 268

// Shallow water wave columns
const NUM_COLS = 60;
const TENSION = 0.024;
const DAMPING = 0.026;
const SPREAD = 0.22;

// Dye grid dimensions
const DYE_W = 40;
const DYE_H = 96;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) || 2,
    parseInt(h.slice(2, 4), 16) || 132,
    parseInt(h.slice(4, 6), 16) || 199,
  ];
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  alpha: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export interface BodyWaterProps {
  percent?: number; // 0 to 100 (default 65)
  waterColor?: string; // default "#38BDF8" (vibrant water blue)
  dyeColor?: string; // default "#0284C7" (azure blue)
  fade?: number; // seconds, default 3
  width?: number | string;
  height?: number | string;
  className?: string;
  label?: string; // default "H2O"
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const BodyWater: React.FC<BodyWaterProps> = ({
  percent = 65,
  waterColor = '#38BDF8',
  dyeColor = '#0284C7',
  fade = 3,
  width = '100%',
  height = '100%',
  className = '',
  label = 'H2O',
  style,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  // Simulation state
  const stateRef = useRef({
    h: new Float32Array(NUM_COLS),
    u: new Float32Array(NUM_COLS),
    dye: new Float32Array(DYE_W * DYE_H),
    dyeTemp: new Float32Array(DYE_W * DYE_H),
    bubbles: [] as Bubble[],
    droplets: [] as Droplet[],
    currentRestY: FEET_Y - (Math.max(0, Math.min(100, percent)) / 100) * SPAN_Y,
    targetPercent: percent,
    time: 0,
    prevPointerX: -1,
    prevPointerY: -1,
    bodyPath: null as Path2D | null,
    cssWidth: 95,
    cssHeight: 195,
    dpr: 1,
  });

  // Keep target percent updated
  useEffect(() => {
    stateRef.current.targetPercent = Math.max(0, Math.min(100, percent));
  }, [percent]);

  // Initialize bubbles
  useEffect(() => {
    const bubbles: Bubble[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: 35 + Math.random() * 50,
        y: FEET_Y - Math.random() * (SPAN_Y * 0.7),
        radius: 1 + Math.random() * 1.5,
        speed: 0.35 + Math.random() * 0.45,
        drift: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.4,
      });
    }
    stateRef.current.bubbles = bubbles;
  }, []);

  // Add dye at view coordinates (120 x 290)
  const addDyeBlob = useCallback((vx: number, vy: number, amount: number) => {
    const s = stateRef.current;
    // Dye only exists below water surface
    if (vy < s.currentRestY - 5) return;

    const gx = (vx / VIEW_W) * DYE_W;
    const gy = (vy / VIEW_H) * DYE_H;
    const radius = 2.8;

    const minX = Math.max(0, Math.floor(gx - radius));
    const maxX = Math.min(DYE_W - 1, Math.ceil(gx + radius));
    const minY = Math.max(0, Math.floor(gy - radius));
    const maxY = Math.min(DYE_H - 1, Math.ceil(gy + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - gx;
        const dy = y - gy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 <= radius * radius) {
          const falloff = Math.exp(-dist2 / (radius * 1.2));
          const idx = y * DYE_W + x;
          s.dye[idx] = Math.min(1.0, s.dye[idx] + amount * falloff);
        }
      }
    }
  }, []);

  // Splash disturbance
  const splash = useCallback(
    (viewX: number, viewY: number, strength = 6) => {
      const s = stateRef.current;
      const colWidth = VIEW_W / (NUM_COLS - 1);
      const centerCol = Math.round(viewX / colWidth);

      for (let i = -4; i <= 4; i++) {
        const c = centerCol + i;
        if (c >= 0 && c < NUM_COLS) {
          const falloff = 1 - Math.abs(i) / 5;
          s.u[c] -= strength * falloff;
        }
      }

      // Add a generous splash of dye
      addDyeBlob(viewX, viewY, 0.7);

      // Spawn 4-6 flying splash droplets
      const dropletCount = 4 + Math.floor(Math.random() * 3);
      for (let d = 0; d < dropletCount; d++) {
        s.droplets.push({
          x: viewX + (Math.random() - 0.5) * 10,
          y: Math.min(viewY, s.currentRestY),
          vx: (Math.random() - 0.5) * 3,
          vy: -2.5 - Math.random() * 3.5,
          radius: 1.2 + Math.random() * 1.2,
          alpha: 0.9,
        });
      }
    },
    [addDyeBlob]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const viewX = nx * VIEW_W;
    const viewY = ny * VIEW_H;

    splash(viewX, viewY, 7);
    stateRef.current.prevPointerX = viewX;
    stateRef.current.prevPointerY = viewY;
    if (onClick) onClick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const viewX = nx * VIEW_W;
    const viewY = ny * VIEW_H;

    const s = stateRef.current;
    let speed = 1;
    if (s.prevPointerX >= 0) {
      const dx = viewX - s.prevPointerX;
      const dy = viewY - s.prevPointerY;
      speed = Math.sqrt(dx * dx + dy * dy);
    }
    s.prevPointerX = viewX;
    s.prevPointerY = viewY;

    // Add dye along movement path inside the water
    const dyeAmount = Math.min(0.85, 0.25 + speed * 0.08);
    addDyeBlob(viewX, viewY, dyeAmount);

    // Ripple if near water surface
    if (Math.abs(viewY - s.currentRestY) < 30) {
      const colWidth = VIEW_W / (NUM_COLS - 1);
      const col = Math.round(viewX / colWidth);
      if (col >= 0 && col < NUM_COLS) {
        s.u[col] += (Math.random() - 0.5) * Math.min(3.5, speed * 0.8 + 1);
      }
    }
  };

  const handlePointerLeave = () => {
    stateRef.current.prevPointerX = -1;
    stateRef.current.prevPointerY = -1;
  };

  // Main Canvas Render & Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Offscreen canvas for fast dye grid rendering and blur
    const offCanvas = document.createElement('canvas');
    offCanvas.width = DYE_W;
    offCanvas.height = DYE_H;
    const offCtx = offCanvas.getContext('2d');
    const offImageData = offCtx?.createImageData(DYE_W, DYE_H);

    // Path2D for silhouette
    if (!stateRef.current.bodyPath) {
      stateRef.current.bodyPath = new Path2D(BODY_PATH_D);
    }
    const bodyPath = stateRef.current.bodyPath;

    // Decay rate calculated from fade duration (clears in ~fade seconds at 60fps)
    const decayRate = Math.pow(0.015, 1 / (60 * Math.max(0.5, fade)));
    const [dyeR, dyeG, dyeB] = hexToRgb(dyeColor);

    // Visibility observer to pause loop when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          stateRef.current.cssWidth = w;
          stateRef.current.cssHeight = h;
          stateRef.current.dpr = dpr;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    let running = true;

    const render = () => {
      if (!running) return;

      if (isVisibleRef.current) {
        const s = stateRef.current;
        s.time += 0.028;

        // Smoothly ease rest water level towards target percent
        const targetRestY = FEET_Y - (s.targetPercent / 100) * SPAN_Y;
        s.currentRestY += (targetRestY - s.currentRestY) * 0.045;

        // --- 1. Shallow Water Physics Substeps ---
        for (let sub = 0; sub < 2; sub++) {
          for (let i = 0; i < NUM_COLS; i++) {
            const force = -TENSION * s.h[i] - DAMPING * s.u[i];
            s.u[i] += force;
            s.h[i] += s.u[i];
          }

          // Wave propagation to neighbor columns
          for (let pass = 0; pass < 6; pass++) {
            for (let i = 0; i < NUM_COLS; i++) {
              if (i > 0) {
                const diff = SPREAD * (s.h[i] - s.h[i - 1]);
                s.u[i - 1] += diff;
                s.h[i - 1] += diff;
              }
              if (i < NUM_COLS - 1) {
                const diff = SPREAD * (s.h[i] - s.h[i + 1]);
                s.u[i + 1] += diff;
                s.h[i + 1] += diff;
              }
            }
          }
        }

        // --- 2. Dye Diffusion, Horizontal Flow & Decay ---
        const diffRate = 0.08;
        for (let y = 1; y < DYE_H - 1; y++) {
          for (let x = 1; x < DYE_W - 1; x++) {
            const idx = y * DYE_W + x;
            const current = s.dye[idx];
            // 4-neighbor diffusion
            const neighbors =
              (s.dye[idx - 1] +
                s.dye[idx + 1] +
                s.dye[idx - DYE_W] +
                s.dye[idx + DYE_W]) *
              0.25;
            let val = current + (neighbors - current) * diffRate;

            // Apply horizontal flow from water velocity u[]
            const colIdx = Math.floor((x / DYE_W) * NUM_COLS);
            const flowU = s.u[Math.min(NUM_COLS - 1, Math.max(0, colIdx))] * 0.02;
            if (flowU > 0.001 && x < DYE_W - 1) {
              val = val * (1 - flowU) + s.dye[idx - 1] * flowU;
            } else if (flowU < -0.001 && x > 0) {
              val = val * (1 + flowU) + s.dye[idx + 1] * -flowU;
            }

            // Decay over fade seconds
            s.dyeTemp[idx] = val * decayRate;
          }
        }
        // Swap buffers
        s.dye.set(s.dyeTemp);

        // --- 3. Update Bubbles ---
        for (const b of s.bubbles) {
          b.y -= b.speed;
          b.x += Math.sin(s.time * 2 + b.drift) * 0.22;

          const distToSurface = b.y - s.currentRestY;
          if (distToSurface < 18) {
            b.alpha = Math.max(0, (distToSurface / 18) * 0.5);
          }

          if (b.y <= s.currentRestY + 2 || b.alpha <= 0.02) {
            b.y = FEET_Y - 4 - Math.random() * 12;
            b.x = 40 + Math.random() * 40;
            b.alpha = 0.35 + Math.random() * 0.35;
          }
        }

        // --- 4. Update Splash Droplets ---
        for (let d = s.droplets.length - 1; d >= 0; d--) {
          const drop = s.droplets[d];
          drop.vy += 0.24; // gravity
          drop.x += drop.vx;
          drop.y += drop.vy;
          drop.alpha -= 0.015;

          if (drop.vy > 0 && drop.y >= s.currentRestY) {
            const colWidth = VIEW_W / (NUM_COLS - 1);
            const c = Math.round(drop.x / colWidth);
            if (c >= 0 && c < NUM_COLS) {
              s.u[c] += drop.vy * 0.4;
            }
            s.droplets.splice(d, 1);
          } else if (drop.alpha <= 0) {
            s.droplets.splice(d, 1);
          }
        }

        // --- 5. Render Offscreen Dye Texture ---
        if (offCtx && offImageData) {
          const data = offImageData.data;
          for (let i = 0; i < DYE_W * DYE_H; i++) {
            const intensity = s.dye[i];
            const p = i * 4;
            data[p] = dyeR;
            data[p + 1] = dyeG;
            data[p + 2] = dyeB;
            data[p + 3] = Math.min(255, Math.round(intensity * 240));
          }
          offCtx.putImageData(offImageData, 0, 0);
        }

        // --- 6. Render to Main Canvas ---
        const { cssWidth, cssHeight, dpr } = s;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        const scaleX = (cssWidth * dpr) / VIEW_W;
        const scaleY = (cssHeight * dpr) / VIEW_H;
        ctx.scale(scaleX, scaleY);

        // Clip everything inside human body silhouette
        ctx.save();
        ctx.clip(bodyPath);

        // Layer A: Head & Shoulders Light Grey (#E3E8ED)
        ctx.fillStyle = '#E3E8ED';
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        // Layer B: Glossy White Water Fill (from surface to feet)
        if (s.currentRestY < FEET_Y) {
          const colWidth = VIEW_W / (NUM_COLS - 1);

          ctx.beginPath();
          const idle0 =
            Math.sin(s.time * 2.2) * 2.0 + Math.sin(s.time * 3.8) * 0.7;
          const y0 = Math.min(FEET_Y + 10, s.currentRestY + s.h[0] + idle0);
          ctx.moveTo(0, y0);

          for (let i = 1; i < NUM_COLS; i++) {
            const x = i * colWidth;
            const idle =
              Math.sin(s.time * 2.2 + i * 0.22) * 2.0 +
              Math.sin(s.time * 3.8 + i * 0.45) * 0.7;
            const y = Math.min(FEET_Y + 10, s.currentRestY + s.h[i] + idle);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(VIEW_W, VIEW_H + 5);
          ctx.lineTo(0, VIEW_H + 5);
          ctx.closePath();

          // Vibrant Realistic Blue Water Gradient (surface to feet)
          const waterGrad = ctx.createLinearGradient(
            0,
            s.currentRestY,
            0,
            FEET_Y
          );
          waterGrad.addColorStop(0, '#7dd3fc'); // Bright sky-blue wave surface
          waterGrad.addColorStop(0.25, waterColor || '#38bdf8'); // Vibrant crystal water
          waterGrad.addColorStop(0.7, '#0284c7'); // Deep clear water
          waterGrad.addColorStop(1, '#0369a1'); // Rich base blue
          ctx.fillStyle = waterGrad;
          ctx.fill();

          // Layer C: Cursor Dye Effect (Blended into Blue Water)
          ctx.save();
          ctx.clip(); // clip dye strictly to the water polygon
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(offCanvas, 0, 0, VIEW_W, VIEW_H);
          ctx.restore();

          // Layer D: Small Rising Bubbles (inside water)
          for (const b of s.bubbles) {
            if (b.y > s.currentRestY - 4) {
              ctx.beginPath();
              ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha.toFixed(2)})`;
              ctx.fill();
            }
          }

          // Flying Splash Droplets
          for (const d of s.droplets) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(224, 242, 254, ${d.alpha.toFixed(2)})`;
            ctx.fill();
          }

          // Surface Glint Line (glowing bright white/cyan water crest)
          ctx.beginPath();
          ctx.moveTo(0, y0);
          for (let i = 1; i < NUM_COLS; i++) {
            const x = i * colWidth;
            const idle =
              Math.sin(s.time * 2.2 + i * 0.22) * 2.0 +
              Math.sin(s.time * 3.8 + i * 0.45) * 0.7;
            const y = Math.min(FEET_Y + 10, s.currentRestY + s.h[i] + idle);
            ctx.lineTo(x, y);
          }
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 5;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // H2O Emblem at chest
        if (label) {
          ctx.font = '800 13px Inter, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(3, 105, 161, 0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(label, 60, 112);
          ctx.shadowBlur = 0;
        }

        ctx.restore(); // end clip

        // Soft light-grey body outline & subtle shading
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = 'rgba(180, 192, 203, 0.85)';
        ctx.stroke(bodyPath);

        ctx.restore(); // end scale
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [waterColor, dyeColor, fade, label]);

  return (
    <div
      ref={containerRef}
      className={`body-water-container ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
        aria-label={`Body water hydration visualizer: ${percent}% full`}
        role="img"
      />
    </div>
  );
};

export default BodyWater;

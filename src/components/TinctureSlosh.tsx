// TinctureSlosh — WebGL2 water-filled interactive button
// Physics computed in JS (Float32Arrays), rendered via WebGL2 fragment shader.
// Falls back to a flat styled <button> when WebGL2 is unavailable.
"use client"; // Safe for Next.js (ignored in Vite/CRA)

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────── Helpers ───────────────────────────── */
function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'Shader compile error');
  return s;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vert: string,
  frag: string
): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? 'Program link error');
  return p;
}

/* ─────────────────────────── Shaders ───────────────────────────── */
const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D u_hmap;      // R channel = (height+1)/2  →  decode as h*2-1
uniform vec2      u_texel;
uniform vec3      u_dye;       // cursor dye colour (olive green)
uniform vec3      u_base;      // base water colour (glossy white)
uniform vec2      u_mouse;     // normalised [0,1], y-up
uniform float     u_dye_mix;   // 0.0 at rest (white), up to 1.0 when cursor interacts

in  vec2 v_uv;
out vec4 outColor;

void main() {
  // ── decode height ──────────────────────────────────────
  float h  = texture(u_hmap, v_uv).r * 2.0 - 1.0;
  float hL = texture(u_hmap, v_uv - vec2(u_texel.x * 1.8, 0.0)).r * 2.0 - 1.0;
  float hR = texture(u_hmap, v_uv + vec2(u_texel.x * 1.8, 0.0)).r * 2.0 - 1.0;
  float hD = texture(u_hmap, v_uv - vec2(0.0, u_texel.y * 1.8)).r * 2.0 - 1.0;
  float hU = texture(u_hmap, v_uv + vec2(0.0, u_texel.y * 1.8)).r * 2.0 - 1.0;

  // ── surface normal from height gradient ────────────────
  vec3 N = normalize(vec3((hL - hR) * 9.0, (hD - hU) * 9.0, 1.0));

  // ── dye bleeds from mouse + wave crests (controlled by u_dye_mix) ───
  float md   = distance(v_uv, u_mouse);
  float dyeT = clamp(1.0 - md * 3.8, 0.0, 1.0);                   // mouse halo
  dyeT       = max(dyeT, clamp(h * 0.65 + 0.22, 0.0, 1.0) * 0.38); // wave crests
  dyeT       *= u_dye_mix;                                         // 0 at rest (white), green on hover

  vec3 col = mix(u_base, u_dye, clamp(dyeT, 0.0, 1.0));

  // ── specular highlight ─────────────────────────────────
  vec3  L    = normalize(vec3(0.35, 0.65, 1.0));
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 56.0);
  col += spec * 0.6 * mix(vec3(1.0), u_dye * 1.4, 0.35 * u_dye_mix);

  // ── Fresnel rim shimmer ────────────────────────────────
  col += (1.0 - abs(N.z)) * 0.22 * mix(vec3(0.92, 0.94, 0.96), u_dye, u_dye_mix);

  // ── caustic flicker from wave interference ─────────────
  float caust = abs((hL - hR) * (hD - hU)) * 0.6;
  col += caust * mix(vec3(0.85, 0.88, 0.92), u_dye, u_dye_mix) * 0.4;

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

/* ─────────────────────────── Types ──────────────────────────────── */
export interface TinctureSloshProps {
  label?: string;
  background?: string;
  colors?: {
    mode?: 'mono' | 'gradient';
    dye?: string;
    base?: string;
    dyes?: string[];
  };
  fade?: number;
  radius?: number;
  response?: {
    pour?: number;
    stir?: number;
    swirl?: number;
    ripple?: number;
    wobble?: number;
    reach?: number;
  };
  reflection?: {
    intensity?: number;
    distance?: number;
    blur?: number;
  };
  advanced?: { vignette?: number };
  font?: {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: string;
  };
  textColor?: string;
  onClick?: () => void;
  link?: string;
  buttonWidth?: number;
  buttonHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ─────────────────────── Simulation constants ────────────────────── */
const SIM = 128;          // grid dimension
const DAMPING = 0.993;    // energy retention per step
const WAVE_C  = 0.28;     // propagation speed coefficient

/* ─────────────────────────── Component ─────────────────────────── */
export function TinctureSlosh({
  label      = '',
  background,
  colors     = {},
  fade       = 2.5,
  radius     = 20,
  response,
  reflection,
  advanced,
  font       = {},
  textColor  = '#111111',
  onClick,
  link,
  buttonWidth  = 480,
  buttonHeight = 64,
  className,
  style,
}: TinctureSloshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);

  /* All mutable GL / physics state lives in a single ref */
  const R = useRef({
    gl:     null as WebGL2RenderingContext | null,
    prog:   null as WebGLProgram | null,
    tex:    null as WebGLTexture | null,
    vao:    null as WebGLVertexArrayObject | null,
    curr:   new Float32Array(SIM * SIM),
    prev:   new Float32Array(SIM * SIM),
    next:   new Float32Array(SIM * SIM),
    pixBuf: new Uint8Array(SIM * SIM * 4),
    mX: -10.0, mY: -10.0,        // Start off-screen so rest state has NO dye spot
    prevMx: -10.0, prevMy: -10.0,
    dyeMix: 0.0,                 // 0.0 = pure white water at rest, 1.0 = full dye
    hovering: false,
    dye:  hexToRgb01(colors.dye  ?? '#7A8B2E'),
    base: hexToRgb01(colors.base ?? '#FFFFFF'),
    fadeDuration: fade,
    raf:  0,
    idleTs: 0,
  });

  /* keep colour and fade refs fresh when props change */
  useEffect(() => {
    R.current.dye  = hexToRgb01(colors.dye  ?? '#7A8B2E');
    R.current.base = hexToRgb01(colors.base ?? '#FFFFFF');
    R.current.fadeDuration = fade || 2.5;
  }, [colors.dye, colors.base, fade]);

  /* ── WebGL initialisation + animation loop ─────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) { setSupported(false); return; }

    const r = R.current;
    r.gl = gl;

    try {
      /* program */
      r.prog = linkProgram(gl, VERT, FRAG);

      /* full-screen quad VAO */
      r.vao = gl.createVertexArray();
      gl.bindVertexArray(r.vao);
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      const posLoc = gl.getAttribLocation(r.prog, 'a_pos');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      /* heightmap texture (RGBA8 – R channel stores packed height) */
      r.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, r.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM, SIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } catch (err) {
      console.warn('TinctureSlosh: WebGL2 init failed —', err);
      setSupported(false);
      return;
    }

    /* ── helper: add a circular drop at normalised position ───────── */
    function addDrop(nx: number, ny: number, strength: number, radius = 9) {
      const cx = Math.round(nx * SIM);
      const cy = Math.round(ny * SIM);
      const { curr } = R.current;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = cx + dx, py = cy + dy;
          if (px < 0 || px >= SIM || py < 0 || py >= SIM) continue;
          const d = Math.sqrt(dx * dx + dy * dy) / radius;
          if (d < 1) curr[py * SIM + px] += (1 - d * d) * strength;
        }
      }
    }

    /* ── wave propagation (discrete wave equation) ─────────────────── */
    function step() {
      const { curr, prev, next } = R.current;
      for (let y = 1; y < SIM - 1; y++) {
        for (let x = 1; x < SIM - 1; x++) {
          const i = y * SIM + x;
          const lap = curr[i - 1] + curr[i + 1] + curr[i - SIM] + curr[i + SIM] - 4 * curr[i];
          let v = (2 * curr[i] - prev[i] + WAVE_C * lap) * DAMPING;
          if (v >  1) v =  1;
          if (v < -1) v = -1;
          next[i] = v;
        }
      }
      R.current.prev.set(curr);
      R.current.curr.set(next);
    }

    /* ── upload heightmap + render ──────────────────────────────────── */
    function draw() {
      const r = R.current;
      const { gl: g, prog: p, tex: t, vao: v } = r;
      if (!g || !p || !t || !v) return;

      /* pack Float32 heights into RGBA8 R channel: (h+1)/2 * 255 */
      for (let i = 0; i < SIM * SIM; i++) {
        r.pixBuf[i * 4]     = ((r.curr[i] + 1) * 0.5 * 255) | 0;
        r.pixBuf[i * 4 + 1] = 0;
        r.pixBuf[i * 4 + 2] = 0;
        r.pixBuf[i * 4 + 3] = 255;
      }
      g.bindTexture(g.TEXTURE_2D, t);
      g.texSubImage2D(g.TEXTURE_2D, 0, 0, 0, SIM, SIM, g.RGBA, g.UNSIGNED_BYTE, r.pixBuf);

      g.useProgram(p);
      g.bindVertexArray(v);
      g.viewport(0, 0, SIM, SIM);

      const ul = (n: string) => g.getUniformLocation(p, n);
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, t);
      g.uniform1i(ul('u_hmap'),    0);
      g.uniform2f(ul('u_texel'),   1 / SIM, 1 / SIM);
      g.uniform3f(ul('u_dye'),     ...r.dye);
      g.uniform3f(ul('u_base'),    ...r.base);
      g.uniform2f(ul('u_mouse'),   r.mX, r.mY);
      g.uniform1f(ul('u_dye_mix'), r.dyeMix);

      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    }

    /* ── main rAF loop ──────────────────────────────────────────────── */
    let alive = true;
    let lastT = performance.now();

    function loop(ts: number) {
      if (!alive) return;
      const r = R.current;
      const dt = Math.min((ts - lastT) / 1000, 0.1);
      lastT = ts;

      /* Dye fade animation:
         - When hovering: dye pours in quickly towards 1.0
         - When not hovering: dye clears smoothly back to 0.0 over fadeDuration (~2.5s) */
      if (r.hovering) {
        r.dyeMix = Math.min(1.0, r.dyeMix + dt * 4.5);
      } else if (r.dyeMix > 0.001) {
        r.dyeMix = Math.max(0.0, r.dyeMix - dt / r.fadeDuration);
      } else {
        r.dyeMix = 0.0;
      }

      /* gentle idle ripple to keep water feeling alive */
      if (ts - r.idleTs > 1800 + Math.random() * 1500) {
        addDrop(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6, 0.32, 7);
        r.idleTs = ts;
      }

      step();
      draw();
      R.current.raf = requestAnimationFrame(loop);
    }

    /* seed a gentle initial wave */
    addDrop(0.5, 0.5, 0.7);

    R.current.raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(R.current.raf);
    };
  }, []);

  /* ── mouse interaction ────────────────────────────────────────────── */
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const r  = R.current;
    const nx = (e.clientX - rect.left)  / rect.width;
    const ny = 1 - (e.clientY - rect.top) / rect.height;

    r.hovering = true;

    /* ripple wave when mouse moves */
    const ddx = nx - r.prevMx, ddy = ny - r.prevMy;
    if (ddx * ddx + ddy * ddy > 0.00008) {
      const cx = Math.round(nx * SIM), cy = Math.round(ny * SIM);
      const rad = 7;
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const px = cx + dx, py = cy + dy;
          if (px < 0 || px >= SIM || py < 0 || py >= SIM) continue;
          const d = Math.sqrt(dx * dx + dy * dy) / rad;
          if (d < 1) r.curr[py * SIM + px] += (1 - d) * 0.6;
        }
      }
      r.prevMx = nx;
      r.prevMy = ny;
    }
    r.mX = nx;
    r.mY = ny;
  }, []);

  const onMouseEnter = useCallback(() => {
    R.current.hovering = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    const r = R.current;
    r.hovering = false;
  }, []);

  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const handleClick = useCallback(() => {
    if (onClick) onClick();
    else if (link) {
      if (navigate) navigate(link);
      else window.location.href = link;
    }
  }, [onClick, link, navigate]);

  const {
    fontFamily = 'Inter, sans-serif',
    fontWeight = 700,
    fontSize   = '26px',
  } = font;

  // Scale factor = (wrapper 840 / 1200) = 0.7
  const scale = 0.7;
  const visibleW = Math.round(buttonWidth * scale);   // 480 * 0.7 = 336px
  const visibleH = Math.round(buttonHeight * scale);  // 64 * 0.7 = 45px
  const visibleR = Math.round(radius * scale);        // 20 * 0.7 = 14px

  // Compute scaled font size (e.g. 26px * 0.7 ≈ 18px)
  const computedFontSize =
    typeof fontSize === 'string' && fontSize.endsWith('px')
      ? `${Math.round(parseFloat(fontSize) * scale)}px`
      : fontSize;

  /* ── Flat fallback (no WebGL2) ───────────────────────────────────── */
  if (!supported) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <button
          onClick={handleClick}
          style={{
            width: `${visibleW}px`,
            height: `${visibleH}px`,
            borderRadius: `${visibleR}px`,
            background: colors.base || '#FFFFFF',
            color: textColor,
            fontFamily,
            fontWeight: fontWeight as number,
            fontSize: computedFontSize,
            border: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          {label}
        </button>
      </div>
    );
  }

  /* ── WebGL2 render ─────────────────────────────────────────────────── */
  const shadowDistance = reflection?.distance ?? 18;
  const shadowBlur = reflection?.blur ?? 15;
  const shadowAlpha = (((reflection?.intensity ?? 25) / 100) * 0.4).toFixed(3);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        ...style, // pointerEvents: 'none' stops the large frame from blocking nearby elements
      }}
    >
      {/* Centered button that receives hover and click events */}
      <div
        onClick={handleClick}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'relative',
          width: `${visibleW}px`,
          height: `${visibleH}px`,
          borderRadius: `${visibleR}px`,
          overflow: 'hidden',
          pointerEvents: 'auto', // Button itself receives hover & clicks
          cursor: 'pointer',
          backgroundColor: background || 'transparent',
          boxShadow: `0 ${shadowDistance}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`,
          border: '1px solid rgba(255, 255, 255, 0.55)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={SIM}
          height={SIM}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Text label */}
        {label && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              color: textColor,
              fontFamily,
              fontWeight: fontWeight as number,
              fontSize: computedFontSize,
              lineHeight: 1,
              textAlign: 'center',
              padding: '0 12px',
              letterSpacing: '0.01em',
              userSelect: 'none',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

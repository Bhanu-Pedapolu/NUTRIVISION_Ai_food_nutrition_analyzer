"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

export interface IsometricButtonFont {
  fontFamily?: string;
  fontWeight?: number | string;
  fontSize?: number | string;
  letterSpacing?: string;
}

export interface IsometricButtonColors {
  fill?: string;
  textColor?: string;
  hoverTextColor?: string;
}

export interface IsometricButtonPrism {
  color?: string;
  thickness?: number;
  float?: number;
  hoverFloat?: number;
  intensity?: number;
}

export interface IsometricButtonCamera {
  tilt?: number;
  rotate?: number;
}

export interface IsometricButtonIcon {
  color?: string;
  hoverColor?: string;
  symbol?: string;
  size?: number;
}

export interface IsometricButtonProps {
  label?: string;
  rounded?: number;
  padding?: string;
  font?: IsometricButtonFont;
  colors?: IsometricButtonColors;
  prism?: IsometricButtonPrism;
  camera?: IsometricButtonCamera;
  addIcon?: boolean;
  icon?: IsometricButtonIcon;
  link?: string;
  newTab?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  className?: string;
  style?: React.CSSProperties;
}

/* ─────────────────────────── Hit Element ─────────────────────────── */
interface HitProps {
  link?: string;
  newTab?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTapStart?: () => void;
  onTapEnd?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function Hit({
  link,
  newTab = false,
  onClick,
  onHoverStart,
  onHoverEnd,
  onTapStart,
  onTapEnd,
  children,
  className,
  style,
}: HitProps) {
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (link && !e.defaultPrevented) {
      if (newTab) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else if (navigate) {
        navigate(link);
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onTapStart={onTapStart}
      onTap={onTapEnd}
      onTapCancel={onTapEnd}
      className={className}
      style={{
        position: "relative",
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        outline: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "manipulation",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

/* ──────────────────────── Main IsometricButton ────────────────────── */
export function IsometricButton({
  label = "CLICK ME",
  rounded = 45,
  padding = "20px 40px",
  font = {},
  colors = {},
  prism = {},
  camera = {},
  addIcon = false,
  icon = {},
  link,
  newTab = false,
  onClick,
  className = "",
  style = {},
}: IsometricButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Resolved configurations with purple defaults
  const fill = colors.fill ?? "#16121D";
  const textColor = colors.textColor ?? "#A05CFF";
  const hoverTextColor = colors.hoverTextColor ?? "#FFFFFF";

  const glowColor = prism.color ?? "#A05CFF";
  const thickness = prism.thickness ?? 15;
  const floatHeight = prism.float ?? 8;
  const hoverFloat = prism.hoverFloat ?? 7;
  const intensity = (prism.intensity ?? 100) / 100;

  const tilt = camera.tilt ?? 49;
  const rotate = camera.rotate ?? -37;

  const fontFamily = font.fontFamily ?? "Inter, sans-serif";
  const fontWeight = font.fontWeight ?? 700;
  const fontSize = typeof font.fontSize === "number" ? `${font.fontSize}px` : (font.fontSize ?? "18px");
  const letterSpacing = font.letterSpacing ?? "0.5px";

  const iconColor = isHovered ? (icon.hoverColor ?? "#FFFFFF") : (icon.color ?? textColor);
  const iconSymbol = icon.symbol ?? "→";
  const iconSize = icon.size ?? 20;

  // Spring animations for 3D bounce
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 22, mass: 0.8 };

  // Current float translation
  const currentZ = isPressed ? 2 : isHovered ? hoverFloat : floatHeight;
  const currentGlowScale = isPressed ? 0.92 : isHovered ? 1.08 : 0.98;
  const currentGlowOpacity = (isPressed ? 0.45 : isHovered ? 0.95 : 0.6) * intensity;
  const currentTiltOffset = isPressed ? 0 : isHovered ? -2 : 0;

  return (
    <div
      className={`iso-btn-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1000,
        WebkitPerspective: 1000,
        ...style,
      }}
    >
      <Hit
        link={link}
        newTab={newTab}
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onTapStart={() => setIsPressed(true)}
        onTapEnd={() => setIsPressed(false)}
      >
        {/* 3D Camera Scene */}
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: `rotateX(${tilt + currentTiltOffset}deg) rotateZ(${rotate}deg)`,
            transition: shouldReduceMotion ? "none" : "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)",
          }}
        >
          {/* Floor Reflection and Glow */}
          <motion.div
            initial={false}
            animate={{
              scale: currentGlowScale,
              opacity: currentGlowOpacity,
            }}
            transition={springTransition}
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: rounded + 12,
              background: `radial-gradient(ellipse at center, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
              filter: `blur(${isHovered ? 14 : 20}px)`,
              transform: "translateZ(-8px)",
              pointerEvents: "none",
            }}
          />

          {/* Under-key glowing bottom face */}
          <motion.div
            initial={false}
            animate={{
              opacity: isHovered ? 0.85 : 0.4,
            }}
            transition={springTransition}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: rounded,
              backgroundColor: glowColor,
              boxShadow: `0 0 ${isHovered ? 25 : 12}px ${glowColor}`,
              transform: `translateZ(${currentZ}px)`,
              pointerEvents: "none",
            }}
          />

          {/* 3D Extrusion Side Slices (stacked depth) */}
          {Array.from({ length: 6 }).map((_, idx) => {
            const stepZ = currentZ + ((idx + 1) * thickness) / 7;
            const darkFactor = 0.5 + (idx / 6) * 0.45;
            return (
              <motion.div
                key={idx}
                initial={false}
                animate={{
                  transform: `translateZ(${stepZ}px)`,
                }}
                transition={springTransition}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: rounded,
                  backgroundColor: fill,
                  filter: `brightness(${darkFactor})`,
                  boxShadow: `0 0 0 1px rgba(0, 0, 0, 0.4), 0 0 8px ${glowColor}33`,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* Top Face / Cap */}
          <motion.div
            initial={false}
            animate={{
              transform: `translateZ(${currentZ + thickness}px)`,
            }}
            transition={springTransition}
            style={{
              position: "relative",
              borderRadius: rounded,
              background: `linear-gradient(145deg, ${fill} 0%, color-mix(in srgb, ${fill} 80%, black 20%) 100%)`,
              padding,
              border: `1.5px solid color-mix(in srgb, ${glowColor} 40%, rgba(255,255,255,0.25))`,
              boxShadow: `
                inset 0 1.5px 1px rgba(255, 255, 255, 0.4),
                inset 0 -1.5px 2px rgba(0, 0, 0, 0.5),
                0 4px 14px rgba(0, 0, 0, 0.4)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              whiteSpace: "nowrap",
            }}
          >
            {/* Label */}
            <span
              style={{
                fontFamily,
                fontWeight,
                fontSize,
                letterSpacing,
                color: isHovered ? hoverTextColor : textColor,
                textShadow: isHovered
                  ? `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`
                  : `0 1px 2px rgba(0,0,0,0.8)`,
                transition: "color 0.2s ease, text-shadow 0.2s ease",
              }}
            >
              {label}
            </span>

            {/* Optional Icon */}
            {addIcon && (
              <span
                style={{
                  color: iconColor,
                  fontSize: `${iconSize}px`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  transform: isHovered ? "translateX(3px)" : "translateX(0)",
                }}
              >
                {iconSymbol}
              </span>
            )}
          </motion.div>
        </div>
      </Hit>
    </div>
  );
}

export default IsometricButton;

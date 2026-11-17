"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export interface ScanGridButtonProps {
  label?: string;
  rounded?: number; // 0 to 100, as a percent of pill shape (100 = fully round)
  padding?: string;
  font?: {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number | string;
    letterSpacing?: string;
    lineHeight?: string;
  };
  colors?: {
    fill?: string;
    hoverFill?: string;
    textColor?: string;
    hoverTextColor?: string;
  };
  scan?: {
    color?: string;
    speed?: number;
  };
  border?: {
    borderWidth?: number | string;
    borderStyle?: string;
    borderColor?: string;
  };
  glitchIntensity?: number;
  addIcon?: boolean;
  icon?: {
    color?: string;
    hoverColor?: string;
    symbol?: string;
    size?: number;
  };
  link?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ScanGridButton: React.FC<ScanGridButtonProps> = ({
  label = "SCAN",
  rounded = 30,
  padding = "16px 40px",
  font = {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 18,
    letterSpacing: "0.5px",
    lineHeight: "1.5em",
  },
  colors = {
    fill: "#0B2A5B",
    hoverFill: "#0F3A80",
    textColor: "#FFFFFF",
    hoverTextColor: "#FFFFFF",
  },
  scan = {
    color: "#3B9EFF",
    speed: 50,
  },
  border = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(59,158,255,0.45)",
  },
  glitchIntensity = 0,
  addIcon = false,
  icon = {
    color: "#FFFFFF",
    hoverColor: "#3B9EFF",
    symbol: "→",
    size: 22,
  },
  link,
  style,
  className = "",
  id,
  children,
  onClick,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Safe navigation support for React Router
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (link) {
      if (navigate) {
        navigate(link);
      } else {
        window.location.href = link;
      }
    }
  };

  // Convert rounded (0 - 100) to border-radius
  const borderRadius =
    rounded >= 100
      ? "9999px"
      : rounded > 0
      ? `${Math.round((rounded / 100) * 36)}px`
      : "0px";

  const scanColor = scan?.color || "#FF5722";
  const scanSpeed = scan?.speed && scan.speed > 0 ? scan.speed : 50;
  const sweepDuration = 100 / scanSpeed; // speed 50 => 2.0s sweep

  // Glitch text shadow calculation
  const textShadow =
    glitchIntensity > 0 && isHovered
      ? `${-2 * glitchIntensity}px 0 #00ffff, ${2 * glitchIntensity}px 0 #ff0055`
      : "none";

  const currentFill = isHovered
    ? colors?.hoverFill || "#0F3A80"
    : colors?.fill || "#0B2A5B";

  const currentTextColor = isHovered
    ? colors?.hoverTextColor || "#FFFFFF"
    : colors?.textColor || "#FFFFFF";

  const currentIconColor = isHovered
    ? icon?.hoverColor || "#3B9EFF"
    : icon?.color || "#FFFFFF";

  const borderWidth =
    typeof border?.borderWidth === "number"
      ? `${border.borderWidth}px`
      : border?.borderWidth || "1px";

  return (
    <motion.button
      type="button"
      id={id}
      className={`scan-grid-button ${className}`}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: padding,
        backgroundColor: currentFill,
        color: currentTextColor,
        borderRadius: borderRadius,
        borderWidth: borderWidth,
        borderStyle: border?.borderStyle || "solid",
        borderColor: border?.borderColor || "rgba(59,158,255,0.45)",
        cursor: "pointer",
        outline: "none",
        fontFamily: font?.fontFamily || "Inter, sans-serif",
        fontWeight: font?.fontWeight || 600,
        fontSize:
          typeof font?.fontSize === "number"
            ? `${font.fontSize}px`
            : font?.fontSize || "18px",
        letterSpacing: font?.letterSpacing || "0.5px",
        lineHeight: font?.lineHeight || "1.5em",
        transition:
          "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: isHovered
          ? `0 0 20px ${scanColor}44, inset 0 0 14px ${scanColor}22, 0 4px 14px rgba(0,0,0,0.1)`
          : "0 2px 8px rgba(0,0,0,0.08)",
        ...style,
      }}
      {...rest}
    >
      {/* Background Cyber Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${scanColor}18 1px, transparent 1px),
            linear-gradient(to bottom, ${scanColor}18 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px",
          pointerEvents: "none",
          opacity: isHovered ? 0.8 : 0.25,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Animated Corner Brackets */}
      {/* Top Left */}
      <motion.div
        animate={isHovered ? { top: 3, left: 3 } : { top: 6, left: 6 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderTop: `2px solid ${scanColor}`,
          borderLeft: `2px solid ${scanColor}`,
          pointerEvents: "none",
          filter: isHovered ? `drop-shadow(0 0 4px ${scanColor})` : "none",
        }}
      />

      {/* Top Right */}
      <motion.div
        animate={isHovered ? { top: 3, right: 3 } : { top: 6, right: 6 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderTop: `2px solid ${scanColor}`,
          borderRight: `2px solid ${scanColor}`,
          pointerEvents: "none",
          filter: isHovered ? `drop-shadow(0 0 4px ${scanColor})` : "none",
        }}
      />

      {/* Bottom Left */}
      <motion.div
        animate={isHovered ? { bottom: 3, left: 3 } : { bottom: 6, left: 6 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderBottom: `2px solid ${scanColor}`,
          borderLeft: `2px solid ${scanColor}`,
          pointerEvents: "none",
          filter: isHovered ? `drop-shadow(0 0 4px ${scanColor})` : "none",
        }}
      />

      {/* Bottom Right */}
      <motion.div
        animate={isHovered ? { bottom: 3, right: 3 } : { bottom: 6, right: 6 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderBottom: `2px solid ${scanColor}`,
          borderRight: `2px solid ${scanColor}`,
          pointerEvents: "none",
          filter: isHovered ? `drop-shadow(0 0 4px ${scanColor})` : "none",
        }}
      />

      {/* Sweeping Laser Scan Line on Hover */}
      {isHovered && (
        <motion.div
          key="scan-line"
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: sweepDuration,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2.5px",
            background: `linear-gradient(90deg, transparent 0%, ${scanColor} 20%, #00F0FF 50%, ${scanColor} 80%, transparent 100%)`,
            boxShadow: `0 0 12px ${scanColor}, 0 0 5px #00F0FF`,
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      )}

      {/* Button Content / Label */}
      <span
        style={{
          position: "relative",
          zIndex: 2,
          textShadow: textShadow,
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {children || label}
      </span>

      {/* Optional Icon */}
      {addIcon && (
        <span
          style={{
            position: "relative",
            zIndex: 2,
            color: currentIconColor,
            fontSize: icon?.size ? `${icon.size}px` : "22px",
            lineHeight: 1,
            transition: "color 0.25s ease, transform 0.2s ease",
            transform: isHovered ? "translateX(3px)" : "none",
            userSelect: "none",
          }}
        >
          {icon?.symbol || "→"}
        </span>
      )}
    </motion.button>
  );
};

export default ScanGridButton;

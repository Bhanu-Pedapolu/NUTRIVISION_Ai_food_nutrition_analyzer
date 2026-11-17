import React, { type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './GlowButton.module.css';

export interface GlowButtonProps {
  label?: ReactNode;
  children?: ReactNode;
  onClick?: (e?: MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** Internal or external link target */
  href?: string;
  /** Gradient for the container border & hover glow. Default: linear-gradient(90deg, #03a9f4, #f441a5) */
  gradient?: string;
  /** Button inner background colour. Default #000000 */
  backgroundColor?: string;
  /** Button text colour. Default #ffffff */
  textColor?: string;
  style?: React.CSSProperties;
  title?: string;
  id?: string;
  role?: string;
  tabIndex?: number;
  target?: string;
  rel?: string;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}

/**
 * GlowButton — Uiverse.io component by Spacious74.
 *
 * Features a neon linear-gradient border (#03a9f4 to #f441a5) with a deep black
 * button base (#000000) and crisp white text. On hover, the container's pseudo-element
 * blurs into an intense ambient neon glow (blur: 1.2em).
 */
export const GlowButton: React.FC<GlowButtonProps> = ({
  label,
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  href,
  gradient = 'linear-gradient(90deg, #03a9f4, #f441a5)',
  backgroundColor = '#000000',
  textColor = '#ffffff',
  style = {},
  title,
  id,
  role,
  tabIndex,
  target,
  rel,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
}) => {
  const cssVars: React.CSSProperties = {
    '--gradient': gradient,
    '--btn-bg': backgroundColor,
    '--btn-color': textColor,
    ...style,
  } as React.CSSProperties;

  const content = label ?? children;

  const buttonProps = {
    id,
    title,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    className: styles.button,
  };

  if (href) {
    const isExternal =
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      target === '_blank';

    if (isExternal) {
      return (
        <div
          className={`${styles.container}${className ? ` ${className}` : ''}`}
          style={cssVars}
          aria-disabled={disabled}
        >
          <a
            {...buttonProps}
            href={href}
            target={target}
            rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
            onClick={disabled ? (e) => e.preventDefault() : onClick as any}
          >
            <span className={styles.content}>{content}</span>
          </a>
        </div>
      );
    }

    return (
      <div
        className={`${styles.container}${className ? ` ${className}` : ''}`}
        style={cssVars}
        aria-disabled={disabled}
      >
        <Link
          {...buttonProps}
          to={href}
          onClick={disabled ? (e) => e.preventDefault() : onClick as any}
        >
          <span className={styles.content}>{content}</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container}${className ? ` ${className}` : ''}`}
      style={cssVars}
      aria-disabled={disabled}
    >
      <button
        {...buttonProps}
        type={type}
        disabled={disabled}
        onClick={onClick}
      >
        <span className={styles.content}>{content}</span>
      </button>
    </div>
  );
};

export default GlowButton;

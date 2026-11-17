/**
 * HoverButton — From Uiverse.io by Spacious74.
 * Neon gradient container (linear-gradient(90deg, #03a9f4, #f441a5)) with a dark button
 * and hover glow with blur(1.2em).
 */
import React, { type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface HoverButtonProps {
  children: ReactNode;
  onClick?: (e?: MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  hovertextColor?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  title?: string;
  id?: string;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
  target?: string;
  rel?: string;
}

const STYLE_ID = 'spacious74-btn-styles';
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
/* From Uiverse.io by Spacious74 */
.spacious-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  background: var(--sp-gradient, linear-gradient(90deg, #03a9f4, #f441a5));
  border-radius: 0.9em;
  transition: all 0.4s ease;
  isolation: isolate;
  text-decoration: none;
  box-sizing: border-box;
}

.spacious-container::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 0.9em;
  z-index: -1;
  filter: blur(0);
  transition: filter 0.4s ease, opacity 0.4s ease;
  opacity: 0;
  pointer-events: none;
}

.spacious-container:hover::before {
  background: var(--sp-gradient, linear-gradient(90deg, #03a9f4, #f441a5));
  filter: blur(1.2em);
  opacity: 1;
}

.spacious-container:active::before {
  filter: blur(0.2em);
  opacity: 1;
}

.spacious-btn {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 600;
  border-radius: 0.7em;
  border: none;
  background-color: var(--sp-bg, #000000);
  color: var(--sp-color, #ffffff);
  cursor: pointer;
  box-shadow: 2px 2px 3px #000000b4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  outline: none;
  text-decoration: none;
  box-sizing: border-box;
  transition: transform 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.spacious-btn:disabled,
.spacious-container[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.spacious-btn:active {
  transform: scale(0.98);
}

.spacious-container.is-transparent {
  background: transparent !important;
  padding: 0 !important;
}

.spacious-container.is-transparent::before {
  display: none !important;
}

.spacious-container.is-transparent .spacious-btn {
  background: var(--sp-bg, transparent) !important;
  box-shadow: none !important;
}
`;
  document.head.appendChild(s);
}

const SIZES: Record<'sm' | 'md' | 'lg', { padding: string; fontSize: string }> = {
  sm: { padding: '0.45em 0.9em', fontSize: '13px' },
  md: { padding: '0.65em 1.4em', fontSize: '15px' },
  lg: { padding: '0.85em 1.8em', fontSize: '17px' },
};

const HoverButton: React.FC<HoverButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  backgroundColor = '#000000',
  textColor = '#ffffff',
  type = 'button',
  href,
  size = 'md',
  style = {},
  title,
  id,
  role,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  target,
  rel,
}) => {
  injectStyles();

  const isTransparent = backgroundColor === 'transparent' || className.includes('navbar__link');
  const sz = SIZES[size];

  const containerStyle: React.CSSProperties = {
    ...style,
  };

  const btnStyle: React.CSSProperties = {
    padding: sz.padding,
    fontSize: sz.fontSize,
    ...(backgroundColor && !isTransparent ? { '--sp-bg': backgroundColor } : {}),
    ...(textColor ? { '--sp-color': textColor } : {}),
  } as React.CSSProperties;

  const btnProps = {
    id,
    title,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    className: 'spacious-btn',
    style: btnStyle,
  };

  const containerClasses = `spacious-container ${isTransparent ? 'is-transparent' : ''} ${className}`.trim();

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
          className={containerClasses}
          style={containerStyle}
          aria-disabled={disabled}
        >
          <a
            {...btnProps}
            href={href}
            target={target}
            rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
            onClick={disabled ? (e) => e.preventDefault() : onClick as any}
          >
            {children}
          </a>
        </div>
      );
    }

    return (
      <div
        className={containerClasses}
        style={containerStyle}
        aria-disabled={disabled}
      >
        <Link
          {...btnProps}
          to={href}
          onClick={disabled ? (e) => e.preventDefault() : onClick as any}
        >
          {children}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      aria-disabled={disabled}
    >
      <button
        {...btnProps}
        type={type}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export { HoverButton };

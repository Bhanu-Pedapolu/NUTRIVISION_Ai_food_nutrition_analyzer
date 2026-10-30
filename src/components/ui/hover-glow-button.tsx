import React, { useRef, useState, type MouseEvent, type ReactNode } from 'react';
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

const SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-xl',
};

const HoverButton: React.FC<HoverButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  glowColor = '#A9B887',
  backgroundColor = '#2E3D28',
  textColor = '#E8E9DF',
  hoverTextColor = '#ffffff',
  type = 'button',
  href,
  size = 'lg',
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
  const elementRef = useRef<any>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setGlowPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const commonClasses = `
    relative inline-block border-none cursor-pointer overflow-hidden
    transition-all duration-300 rounded-xl z-10 font-sans no-underline
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9B887] focus-visible:ring-offset-2
    shadow-[0_4px_16px_rgba(46,61,40,0.2)] hover:shadow-[0_8px_24px_rgba(46,61,40,0.32)]
    hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
    ${SIZES[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const commonStyle: React.CSSProperties = {
    backgroundColor,
    color: isHovered ? hoverTextColor : textColor,
    ...style,
  };

  const glowContent = (
    <>
      <div
        className={`
          absolute w-[200px] h-[200px] rounded-full opacity-50 pointer-events-none
          transition-transform duration-[400ms] ease-out -translate-x-1/2 -translate-y-1/2
          ${isHovered ? 'scale-[1.2]' : 'scale-0'}
        `}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 10%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );

  // If href is provided, render as external link (<a>) or router link (<Link>)
  if (href) {
    const isExternal =
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      target === '_blank';

    if (isExternal) {
      return (
        <a
          ref={elementRef}
          id={id}
          title={title}
          href={href}
          target={target}
          rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
          role={role}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-current={ariaCurrent}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHaspopup}
          onClick={disabled ? (e) => e.preventDefault() : onClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={commonClasses}
          style={commonStyle}
        >
          {glowContent}
        </a>
      );
    }

    return (
      <Link
        ref={elementRef}
        id={id}
        title={title}
        to={href}
        role={role}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={commonClasses}
        style={commonStyle}
      >
        {glowContent}
      </Link>
    );
  }

  return (
    <button
      ref={elementRef}
      id={id}
      title={title}
      type={type}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={commonClasses}
      style={commonStyle}
    >
      {glowContent}
    </button>
  );
};

export { HoverButton };

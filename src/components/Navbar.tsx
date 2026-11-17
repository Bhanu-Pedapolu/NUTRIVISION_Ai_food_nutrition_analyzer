// NutriVision — Top Navbar with macOS-Style Magnifying Dock Navigation
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Flame,
  Camera,
  Target,
  Droplets,
  BarChart2,
  Star,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Leaf,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { cn } from '@/lib/utils';
import './Navbar.css';

interface NavRouteItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
}

const NAV_ITEMS: NavRouteItem[] = [
  { id: 'home', path: '/', label: 'Home', icon: Home },
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calculator', path: '/calculator', label: 'Calories & Plans', icon: Flame },
  { id: 'analyze', path: '/analyze', label: 'AI Scanner', icon: Camera },
  { id: 'plans', path: '/meal-plan', label: 'Diet Plans', icon: Target },
  { id: 'hydration', path: '/dashboard#hydration', label: 'Hydration', icon: Droplets },
  { id: 'tracker', path: '/tracker', label: 'Tracker', icon: BarChart2 },
  { id: 'reviews', path: '/#testimonials', label: 'Reviews', icon: Star },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userName, logout } = useAppStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    if (path.includes('#')) {
      const [pathname, hash] = path.split('#');
      if (location.pathname === pathname) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 180);
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (path.includes('#')) {
      const [pathname, hash] = path.split('#');
      return location.pathname === pathname && location.hash === `#${hash}`;
    }
    return location.pathname.startsWith(path);
  };

  if (location.pathname === '/qr-mobile') return null;

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar__inner">
          {/* Logo with Sage Green and Deep Olive */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="navbar__logo"
            aria-label="NutriVision Home"
          >
            <div className="navbar__logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="16" cy="18" r="10" stroke="#2E3D28" strokeWidth="2" fill="none" />
                <path d="M16 12C16 12 20 9 23 7" stroke="#2E3D28" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="23" cy="7" r="3.5" fill="#2E3D28" fillOpacity="0.25" stroke="#2E3D28" strokeWidth="1.6" />
                <path d="M23 5.5L23 8.5M21.5 7L24.5 7" stroke="#2E3D28" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="16" cy="18" r="4" fill="#2E3D28" fillOpacity="0.2" />
                <circle cx="16" cy="18" r="2" fill="#E8E9DF" />
              </svg>
            </div>
            <span className="navbar__logo-text">NutriVision</span>
          </Link>

          {/* Desktop: macOS-Style Magnifying Dock Navigation in exact navbar location */}
          <div className="navbar__dock-container flex items-center justify-center flex-1" role="menubar">
            <Dock
              panelHeight={50}
              magnification={66}
              distance={110}
              className="bg-[#2E3D28] border border-[#A9B887]/35 shadow-[0_4px_18px_rgba(46,61,40,0.35)] px-3 py-1 rounded-2xl gap-2"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);

                return (
                  <DockItem
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    aria-label={item.label}
                    className="group flex flex-col items-center justify-center p-0.5"
                  >
                    <DockLabel
                      position="bottom"
                      className="bg-[#2E3D28] text-[#E8E9DF] border-[#A9B887]/40 shadow-xl font-medium tracking-wide"
                    >
                      {item.label}
                    </DockLabel>
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 select-none',
                        active
                          ? 'bg-[#A9B887]/30 ring-2 ring-[#A9B887] shadow-[0_0_12px_rgba(169,184,135,0.6)]'
                          : 'bg-[#A9B887]/15 hover:bg-[#A9B887]/25 hover:shadow-[0_0_8px_rgba(169,184,135,0.35)]'
                      )}
                    >
                      <DockIcon>
                        <Icon
                          size={18}
                          color="#E8E9DF"
                          className={cn(
                            'transition-transform duration-200',
                            active ? 'scale-110 text-[#E8E9DF]' : 'group-hover:scale-105'
                          )}
                        />
                      </DockIcon>
                    </div>
                  </DockItem>
                );
              })}
            </Dock>
          </div>

          {/* Right Actions */}
          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <HoverButton
                  onClick={() => handleNavigate('/analyze')}
                  size="sm"
                  className="navbar__analyze-btn font-semibold"
                  backgroundColor="#2E3D28"
                  glowColor="#A9B887"
                  textColor="#E8E9DF"
                  hoverTextColor="#E8E9DF"
                  id="nav-analyze-btn"
                >
                  <Camera size={14} aria-hidden="true" /> Analyze Food
                </HoverButton>
                <button
                  className="navbar__avatar"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  id="nav-user-menu-btn"
                >
                  <span>{userName?.charAt(0).toUpperCase() || 'U'}</span>
                </button>
              </>
            ) : (
              <>
                <HoverButton
                  href="/login"
                  size="sm"
                  className="font-medium"
                  backgroundColor="transparent"
                  textColor="#2E3D28"
                  hoverTextColor="#1e291b"
                  glowColor="rgba(46, 61, 40, 0.2)"
                >
                  Sign In
                </HoverButton>
                <HoverButton
                  href="/register"
                  size="sm"
                  className="font-semibold"
                  backgroundColor="#2E3D28"
                  glowColor="#2E3D28"
                  textColor="#E8E9DF"
                  hoverTextColor="#ffffff"
                >
                  Get Started
                </HoverButton>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              id="nav-hamburger-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile / Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="navbar__dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="menu"
            >
              {isAuthenticated && (
                <>
                  <div className="navbar__dropdown-user">
                    <div className="navbar__dropdown-avatar">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="navbar__dropdown-name">{userName}</div>
                      <div className="navbar__dropdown-email">Pro Wellness Member</div>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                </>
              )}

              {/* Navigation Routes */}
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = isItemActive(path);
                return (
                  <HoverButton
                    key={path}
                    onClick={() => {
                      handleNavigate(path);
                      setMenuOpen(false);
                    }}
                    size="sm"
                    className={`w-full justify-start text-left mb-1 font-medium ${
                      isActive ? 'font-semibold' : ''
                    }`}
                    backgroundColor={isActive ? 'rgba(169, 184, 135, 0.25)' : 'transparent'}
                    textColor={isActive ? '#ffffff' : 'rgba(232, 233, 223, 0.85)'}
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    style={isActive ? { borderLeft: '3px solid #A9B887' } : undefined}
                  >
                    <span className="inline-flex items-center gap-3 w-full">
                      <Icon size={16} aria-hidden="true" color={isActive ? '#A9B887' : 'inherit'} />
                      {label}
                    </span>
                  </HoverButton>
                );
              })}

              <div className="navbar__dropdown-divider" />

              <HoverButton
                href="/weather"
                size="sm"
                className={`w-full justify-start text-left mb-1 font-medium ${
                  location.pathname === '/weather' ? 'font-semibold' : ''
                }`}
                backgroundColor={location.pathname === '/weather' ? 'rgba(169, 184, 135, 0.2)' : 'transparent'}
                textColor={location.pathname === '/weather' ? '#ffffff' : 'rgba(232, 233, 223, 0.8)'}
                hoverTextColor="#ffffff"
                glowColor="#A9B887"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <span className="inline-flex items-center gap-3 w-full">
                  <span>🌤️</span> Weather & Food
                </span>
              </HoverButton>

              <HoverButton
                href="/seasonal"
                size="sm"
                className={`w-full justify-start text-left mb-1 font-medium ${
                  location.pathname === '/seasonal' ? 'font-semibold' : ''
                }`}
                backgroundColor={location.pathname === '/seasonal' ? 'rgba(169, 184, 135, 0.2)' : 'transparent'}
                textColor={location.pathname === '/seasonal' ? '#ffffff' : 'rgba(232, 233, 223, 0.8)'}
                hoverTextColor="#ffffff"
                glowColor="#A9B887"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <span className="inline-flex items-center gap-3 w-full">
                  <Leaf size={16} aria-hidden="true" color="#A9B887" /> Seasonal Foods
                </span>
              </HoverButton>

              {isAuthenticated ? (
                <>
                  <div className="navbar__dropdown-divider" />
                  <HoverButton
                    href="/settings"
                    size="sm"
                    className="w-full justify-start text-left mb-1 font-medium"
                    backgroundColor="transparent"
                    textColor="#E8E9DF"
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="inline-flex items-center gap-3 w-full">
                      <Settings size={16} aria-hidden="true" /> Settings
                    </span>
                  </HoverButton>
                  <HoverButton
                    size="sm"
                    className="navbar__dropdown-item--danger text-sm py-2 px-3 w-full justify-start font-medium"
                    backgroundColor="transparent"
                    textColor="#E8E9DF"
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span className="inline-flex items-center gap-3 w-full">
                      <LogOut size={16} aria-hidden="true" color="#A9B887" /> Sign Out
                    </span>
                  </HoverButton>
                </>
              ) : (
                <>
                  <div className="navbar__dropdown-divider" />
                  <HoverButton
                    href="/login"
                    size="sm"
                    className="w-full justify-start text-left mb-1.5 font-medium"
                    backgroundColor="transparent"
                    textColor="rgba(232, 233, 223, 0.85)"
                    hoverTextColor="#A9B887"
                    glowColor="#A9B887"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </HoverButton>
                  <HoverButton
                    href="/register"
                    size="sm"
                    className="w-full justify-start text-left font-semibold"
                    backgroundColor="#A9B887"
                    textColor="#2E3D28"
                    hoverTextColor="#2E3D28"
                    glowColor="#A9B887"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Create Account
                  </HoverButton>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

// NutriVision — Navbar Component (3-Color Palette: Soft White, Sage Green, Deep Olive)
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Camera, BarChart2, BookOpen, User, LogOut,
  Settings, Menu, X, Leaf, Flame
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HoverButton } from '@/components/ui/hover-glow-button';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/analyze', label: 'Analyze', icon: Camera },
  { path: '/calculator', label: 'Calculator', icon: Flame },
  { path: '/meal-plan', label: 'Meal Plan', icon: BookOpen },
  { path: '/tracker', label: 'Tracker', icon: BarChart2 },
  { path: '/profile', label: 'Profile', icon: User },
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

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (location.pathname === '/qr-mobile') return null;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">
          {/* Logo with Sage Green and Deep Olive */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar__logo" aria-label="NutriVision Home">
            <div className="navbar__logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="16" cy="18" r="10" stroke="#A9B887" strokeWidth="1.8" fill="none"/>
                <path d="M16 12C16 12 20 9 23 7" stroke="#A9B887" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="23" cy="7" r="3.5" fill="#A9B887" fillOpacity="0.3" stroke="#A9B887" strokeWidth="1.5"/>
                <path d="M23 5.5L23 8.5M21.5 7L24.5 7" stroke="#A9B887" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="16" cy="18" r="4" fill="#A9B887" fillOpacity="0.2"/>
                <circle cx="16" cy="18" r="2" fill="#E8E9DF"/>
              </svg>
            </div>
            <span className="navbar__logo-text">NutriVision</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="navbar__links" role="menubar">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <HoverButton
                    key={path}
                    href={path}
                    size="sm"
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    className={`navbar__link-hover-btn font-semibold ${
                      isActive ? 'navbar__link-hover-btn--active' : ''
                    }`}
                    backgroundColor={isActive ? 'rgba(169, 184, 135, 0.28)' : 'transparent'}
                    textColor="#ffffff"
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    style={
                      isActive
                        ? { borderBottom: '2.5px solid #A9B887' }
                        : undefined
                    }
                  >
                    <Icon size={16} aria-hidden="true" color="#ffffff" />
                    <span>{label}</span>
                  </HoverButton>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <HoverButton
                  href="/analyze"
                  size="sm"
                  className="navbar__analyze-btn font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#2E3D28"
                  hoverTextColor="#2E3D28"
                  id="nav-analyze-btn"
                >
                  <Camera size={14} aria-hidden="true" /> Analyze Food
                </HoverButton>
                <button
                  className="navbar__avatar"
                  onClick={() => setMenuOpen(prev => !prev)}
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
                  textColor="rgba(232, 233, 223, 0.85)"
                  hoverTextColor="#A9B887"
                  glowColor="rgba(169, 184, 135, 0.4)"
                >
                  Sign In
                </HoverButton>
                <HoverButton
                  href="/register"
                  size="sm"
                  className="font-semibold"
                  backgroundColor="#A9B887"
                  glowColor="#A9B887"
                  textColor="#2E3D28"
                  hoverTextColor="#2E3D28"
                >
                  Get Started
                </HoverButton>
              </>
            )}

            {/* Hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(prev => !prev)}
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
              {isAuthenticated ? (
                <>
                  <div className="navbar__dropdown-user">
                    <div className="navbar__dropdown-avatar">{userName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="navbar__dropdown-name">{userName}</div>
                      <div className="navbar__dropdown-email">Pro Wellness Member</div>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(path);
                    return (
                      <HoverButton
                        key={path}
                        href={path}
                        size="sm"
                        className={`w-full justify-start text-left mb-1 font-medium ${
                          isActive ? 'font-semibold' : ''
                        }`}
                        backgroundColor={isActive ? 'rgba(169, 184, 135, 0.2)' : 'transparent'}
                        textColor={isActive ? '#ffffff' : 'rgba(232, 233, 223, 0.8)'}
                        hoverTextColor="#ffffff"
                        glowColor="#A9B887"
                        role="menuitem"
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        style={isActive ? { borderLeft: '3px solid #A9B887' } : undefined}
                      >
                        <span className="inline-flex items-center gap-3 w-full">
                          <Icon size={16} aria-hidden="true" color={isActive ? '#A9B887' : 'inherit'} /> {label}
                        </span>
                      </HoverButton>
                    );
                  })}
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
                    aria-current={location.pathname === '/weather' ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    style={location.pathname === '/weather' ? { borderLeft: '3px solid #A9B887' } : undefined}
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
                    aria-current={location.pathname === '/seasonal' ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    style={location.pathname === '/seasonal' ? { borderLeft: '3px solid #A9B887' } : undefined}
                  >
                    <span className="inline-flex items-center gap-3 w-full">
                      <Leaf size={16} aria-hidden="true" color="#A9B887" /> Seasonal Foods
                    </span>
                  </HoverButton>
                  <HoverButton
                    href="/challenges"
                    size="sm"
                    className={`w-full justify-start text-left mb-1 font-medium ${
                      location.pathname === '/challenges' ? 'font-semibold' : ''
                    }`}
                    backgroundColor={location.pathname === '/challenges' ? 'rgba(169, 184, 135, 0.2)' : 'transparent'}
                    textColor={location.pathname === '/challenges' ? '#ffffff' : 'rgba(232, 233, 223, 0.8)'}
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    role="menuitem"
                    aria-current={location.pathname === '/challenges' ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    style={location.pathname === '/challenges' ? { borderLeft: '3px solid #A9B887' } : undefined}
                  >
                    <span className="inline-flex items-center gap-3 w-full">
                      <span>🏆</span> Challenges
                    </span>
                  </HoverButton>
                  <div className="navbar__dropdown-divider" />
                  <HoverButton
                    href="/settings"
                    size="sm"
                    className={`w-full justify-start text-left mb-1 font-medium ${
                      location.pathname === '/settings' ? 'font-semibold' : ''
                    }`}
                    backgroundColor={location.pathname === '/settings' ? 'rgba(169, 184, 135, 0.2)' : 'transparent'}
                    textColor={location.pathname === '/settings' ? '#ffffff' : 'rgba(232, 233, 223, 0.8)'}
                    hoverTextColor="#ffffff"
                    glowColor="#A9B887"
                    role="menuitem"
                    aria-current={location.pathname === '/settings' ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    style={location.pathname === '/settings' ? { borderLeft: '3px solid #A9B887' } : undefined}
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

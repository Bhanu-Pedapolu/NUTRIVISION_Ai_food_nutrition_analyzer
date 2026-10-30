// NutriVision — Full-Screen Website Entry Video Player
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import './EntryVideoModal.css';

interface EntryVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath?: string;
}

export function EntryVideoModal({ isOpen, onClose, targetPath = '/dashboard' }: EntryVideoModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAppStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoSrc, setVideoSrc] = useState('/entry-video.mp4');

  const controlsTimeoutRef = useRef<number | null>(null);

  // Directly navigate to Home Page
  const proceedToHome = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();

    // Ensure session is initialized so Home page loads smoothly
    if (!isAuthenticated) {
      login('guest-demo-user', 'guest@nutrivision.ai', 'Welcome');
    }

    toast.success('Welcome to NutriVision! 🥗', {
      icon: '✨',
      duration: 3000,
    });

    navigate(targetPath);
  }, [isAuthenticated, login, navigate, onClose, targetPath]);

  // Autoplay setup when opened
  useEffect(() => {
    if (isOpen) {
      setVideoSrc('/entry-video.mp4');

      const attemptPlay = () => {
        const vid = videoRef.current;
        if (!vid) return;

        vid.muted = isMuted;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
            })
            .catch((err) => {
              console.warn('Autoplay caught:', err);
              vid.muted = true;
              setIsMuted(true);
              vid.play()
                .then(() => setIsLoading(false))
                .catch((e) => {
                  console.error('Final autoplay error:', e);
                  setIsLoading(false);
                });
            });
        }
      };

      attemptPlay();
      const timer = setTimeout(attemptPlay, 60);
      return () => clearTimeout(timer);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen, isMuted]);

  // Escape key to skip directly
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        proceedToHome();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, proceedToHome]);

  // Mouse activity timer for hiding UI controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const newMuted = !vid.muted;
    vid.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVideoError = () => {
    console.warn('Playback error on:', videoSrc);
    if (videoSrc === '/entry-video.mp4') {
      setVideoSrc('/entry-video.mov');
      setIsLoading(true);
    } else {
      proceedToHome();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fullscreen-video-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onMouseMove={handleMouseMove}
        >
          {/* Fullscreen Video Container (Strict 16:9 Aspect Ratio) */}
          <div className="fullscreen-video-container">
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              className="fullscreen-video-element"
              playsInline
              preload="auto"
              autoPlay
              muted={isMuted}
              onLoadedData={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
              onCanPlayThrough={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onEnded={proceedToHome}
              onError={handleVideoError}
            />
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="fullscreen-video-loading">
              <Loader2 size={46} className="animate-spin text-emerald-400" />
            </div>
          )}

          {/* Top Floating Controls */}
          <div className={`fullscreen-video-topbar ${showControls ? 'visible' : ''}`}>
            <button
              className="fullscreen-sound-btn"
              onClick={toggleMute}
              title={isMuted ? 'Turn on sound' : 'Mute'}
            >
              {isMuted ? (
                <>
                  <VolumeX size={18} />
                  <span>Unmute 🔊</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} />
                  <span>Sound On</span>
                </>
              )}
            </button>

            <button
              className="fullscreen-skip-btn"
              onClick={proceedToHome}
              title="Skip directly to Home page (Esc)"
            >
              <span>Skip to Home</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// NutriVision — Mobile QR Companion Page
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, Upload, CheckCircle2, ArrowRight, Sparkles, Smartphone,
  RefreshCw, Check, AlertCircle, Wifi
} from 'lucide-react';
import toast from 'react-hot-toast';
import { HoverButton } from '@/components/ui/hover-glow-button';
import { useAppStore } from '../store/useAppStore';
import { pingQRSession, uploadQRImage } from '../services/foodAnalysisService';
import './QRCompanionPage.css';

const MOBILE_SAMPLES = [
  { name: 'Chicken Biryani', img: '/chicken-biryani.jpg' },
  { name: 'Buddha Bowl', img: '/salad-bowl.jpg' },
  { name: 'Paneer Tikka', img: '/paneer-tikka.jpg' },
  { name: 'Smoothie Bowl', img: '/smoothie-bowl.jpg' },
  { name: 'Coconut Water', img: '/coconut-water.jpg' },
];

export function QRCompanionPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'nv-sync-default';

  const { setQRImage } = useAppStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [synced, setSynced] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Ping backend on mount to notify laptop that phone has joined
  useEffect(() => {
    let isMounted = true;
    pingQRSession(sessionId, 'Mobile Smartphone').then((ok) => {
      if (isMounted) {
        setConnected(ok);
      }
    });
    return () => { isMounted = false; };
  }, [sessionId]);

  const compressFileToDataUrl = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // Create memory-efficient blob URL to avoid loading 20MB into mobile JS heap
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800; // Optimal 800px for instant mobile Wi-Fi transfer (~80-120KB)
          let width = img.naturalWidth || 600;
          let height = img.naturalHeight || 600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
            URL.revokeObjectURL(blobUrl);
            resolve(dataUrl);
          } else {
            URL.revokeObjectURL(blobUrl);
            const r = new FileReader();
            r.onload = (ev) => resolve(ev.target?.result as string);
            r.onerror = reject;
            r.readAsDataURL(file);
          }
        } catch (err) {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        const r = new FileReader();
        r.onload = (ev) => resolve(ev.target?.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      };
      img.src = blobUrl;
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>, sourceName: string = 'Mobile Gallery Photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsTransmitting(true);
      setErrorMsg(null);
      setSynced(false);

      const compressedDataUrl = await compressFileToDataUrl(file);
      setSelectedPhoto(compressedDataUrl);

      // Auto-beam to laptop immediately so user gets instant transfer
      const ok = await uploadQRImage(sessionId, compressedDataUrl, sourceName);
      setIsTransmitting(false);
      if (ok) {
        setQRImage(compressedDataUrl);
        setSynced(true);
        toast.success('🚀 Photo beamed to laptop screen!', { icon: '✨' });
      } else {
        setErrorMsg('Could not beam photo to desktop. Please make sure both devices are on the same Wi-Fi network.');
        toast.error('Sync failed. Please try again.');
      }
    } catch {
      setIsTransmitting(false);
      setErrorMsg('Failed to process image from gallery/camera. Please try a different photo.');
    }
  };

  const handleSelectPreset = (imgUrl: string) => {
    // Convert to canvas data URL for reliable cross-device transmission
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      const dataUrl = ctx ? canvas.toDataURL('image/jpeg', 0.9) : imgUrl;
      setSelectedPhoto(dataUrl);
      setSynced(false);
      setErrorMsg(null);
      // Auto-beam preset immediately to laptop
      setIsTransmitting(true);
      uploadQRImage(sessionId, dataUrl, 'Mobile Preset Meal').then((ok) => {
        setIsTransmitting(false);
        if (ok) {
          setQRImage(dataUrl);
          setSynced(true);
          toast.success('🚀 Preset beamed to laptop screen!', { icon: '✨' });
        }
      }).catch(() => {
        setIsTransmitting(false);
      });
    };
    img.onerror = () => {
      setSelectedPhoto(imgUrl);
      setSynced(false);
      setErrorMsg(null);
    };
    img.src = imgUrl;
  };

  const handleBeamToDesktop = async () => {
    if (!selectedPhoto) return;
    setIsTransmitting(true);
    setErrorMsg(null);

    try {
      const ok = await uploadQRImage(sessionId, selectedPhoto, 'Mobile Phone Camera');
      if (ok) {
        // Also update local state
        setQRImage(selectedPhoto);
        setIsTransmitting(false);
        setSynced(true);
        toast.success('Synced to Desktop! Check your computer screen.', { icon: '🚀' });
      } else {
        setIsTransmitting(false);
        setErrorMsg('Could not beam photo to desktop. Please make sure both devices are on the same Wi-Fi network.');
        toast.error('Sync failed. Check laptop connection.');
      }
    } catch (err: any) {
      setIsTransmitting(false);
      setErrorMsg(err?.message || 'Network error transmitting image to laptop.');
    }
  };

  const handleResetForNewPhoto = () => {
    setSelectedPhoto(null);
    setSynced(false);
    setErrorMsg(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    cameraInputRef.current?.click();
  };

  return (
    <div className="qr-companion-page">
      <div className="companion-container">
        {/* Header */}
        <div className="companion-header">
          <div className="companion-logo">
            <Smartphone size={24} />
          </div>
          <h1>NutriVision Companion</h1>
          <p>Connected to Desktop Session</p>
          <span className="live-status-badge">
            <span className="live-dot"></span> Session: {sessionId}
          </span>
          {connected && (
            <div className="connection-pill" style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <Wifi size={12} /> Live Link Active
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="companion-alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Capture Zone */}
        <div className="companion-card capture-card">
          {selectedPhoto ? (
            <div className="selected-preview-wrap">
              <img src={selectedPhoto} alt="Selected meal" className="selected-preview-img" />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <HoverButton
                  className="text-xs px-3 py-1.5 font-medium"
                  backgroundColor="rgba(45, 106, 79, 0.12)"
                  textColor="#2d6a4f"
                  hoverTextColor="#1b4332"
                  glowColor="#52b788"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Camera size={14} /> Retake Camera
                  </span>
                </HoverButton>
                <HoverButton
                  className="text-xs px-3 py-1.5 font-medium"
                  backgroundColor="rgba(45, 106, 79, 0.12)"
                  textColor="#2d6a4f"
                  hoverTextColor="#1b4332"
                  glowColor="#52b788"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Upload size={14} /> From Gallery
                  </span>
                </HoverButton>
              </div>
            </div>
          ) : (
            <div className="camera-trigger-box">
              <div className="camera-trigger-icon" onClick={() => cameraInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                <Camera size={42} />
              </div>
              <h3>Snap Your Meal</h3>
              <p>Take a live picture of your food or choose an existing photo</p>
              
              <div style={{ display: 'flex', gap: '0.6rem', width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
                <HoverButton
                  className="text-sm px-4 py-2.5 font-semibold flex-1"
                  backgroundColor="#2d6a4f"
                  glowColor="#52b788"
                  textColor="#ffffff"
                  hoverTextColor="#67e8f9"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Camera size={16} /> Open Camera
                  </span>
                </HoverButton>
                <HoverButton
                  className="text-sm px-4 py-2.5 font-semibold flex-1"
                  backgroundColor="rgba(45, 106, 79, 0.12)"
                  textColor="#2d6a4f"
                  hoverTextColor="#1b4332"
                  glowColor="#52b788"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Upload size={16} /> Choose Photo
                  </span>
                </HoverButton>
              </div>
            </div>
          )}

          {/* Camera input with environment capture for rear camera */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
            onChange={(e) => handlePhotoSelect(e, 'Mobile Live Camera')}
            style={{ display: 'none' }}
          />

          {/* Gallery input without capture attribute */}
          <input
            type="file"
            ref={galleryInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
            onChange={(e) => handlePhotoSelect(e, 'Mobile Gallery Photo')}
            style={{ display: 'none' }}
          />

          {/* Preset Buttons for Quick Testing */}
          <div className="quick-presets-section">
            <span>Or test with a preset meal:</span>
            <div className="preset-scroll-row">
              {MOBILE_SAMPLES.map((sample, i) => (
                <button
                  key={i}
                  className="preset-thumb-btn"
                  onClick={() => handleSelectPreset(sample.img)}
                >
                  <img src={sample.img} alt={sample.name} />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sync Button */}
          {selectedPhoto && (
            <HoverButton
              className={`w-full text-base px-6 py-3.5 font-bold ${synced ? 'synced' : ''}`}
              backgroundColor={synced ? '#10b981' : '#2d6a4f'}
              glowColor={synced ? '#34d399' : '#52b788'}
              textColor="#ffffff"
              hoverTextColor="#ffffff"
              onClick={handleBeamToDesktop}
              disabled={isTransmitting || synced}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isTransmitting ? (
                  <>
                    <Sparkles size={18} className="spin-icon" /> Beaming to Laptop...
                  </>
                ) : synced ? (
                  <>
                    <Check size={18} /> Sent to Laptop Screen!
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} /> Beam Picture to Laptop Screen 🚀
                  </>
                )}
              </span>
            </HoverButton>
          )}
        </div>

        {synced && (
          <motion.div
            className="sync-success-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={36} color="#10b981" />
            <h3>Picture Sent to Your Laptop!</h3>
            <p>The photo is now showing directly on your laptop screen. Look at your computer and click <strong>"Scan & Analyze"</strong> to run AI nutrition breakdown.</p>
            <HoverButton
              className="w-full text-sm px-4 py-2 font-medium"
              style={{ marginTop: '1rem' }}
              backgroundColor="rgba(45, 106, 79, 0.12)"
              textColor="#2d6a4f"
              hoverTextColor="#1b4332"
              glowColor="#52b788"
              onClick={handleResetForNewPhoto}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Camera size={14} /> Take Another Meal Photo
              </span>
            </HoverButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// NutriVision — Food Analysis Service
// Powered by Google Gemini Vision API backend with smart fallback

import type { FoodAnalysis } from '../types';
import { DEMO_ANALYSIS } from '../data/demoData';

// Dynamic API base URL that works on localhost, LAN IP (mobile), and proxies
export const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    return path.startsWith('/') ? path : `/${path}`;
  }
  return `http://localhost:8000${path.startsWith('/') ? path : `/${path}`}`;
};

export interface AnalysisResult {
  success: boolean;
  data?: FoodAnalysis;
  error?: string;
  isDemoMode?: boolean;
}

export interface NetworkInfo {
  lan_ip: string;
  all_ips?: string[];
  backend_url: string;
  companion_path: string;
}

export interface QRSessionStatus {
  status: 'waiting' | 'ready' | 'consumed';
  connected: boolean;
  image?: string | null;
  device?: string;
}

/**
 * Resets a QR session state so a new photo can be beamed.
 */
export async function resetQRSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}/reset`), { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Discovers host LAN IP from FastAPI backend for mobile QR access.
 */
export async function getNetworkInfo(): Promise<NetworkInfo | null> {
  try {
    const res = await fetch(getApiUrl('/api/qr/network-info'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/network-info`;
        const res = await fetch(direct, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
  }
  return null;
}

/**
 * Notifies the desktop session that a mobile phone has connected.
 */
export async function pingQRSession(sessionId: string, deviceInfo?: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}/ping`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_info: deviceInfo || navigator.userAgent })
    });
    return res.ok;
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}/ping`;
        const res = await fetch(direct, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_info: deviceInfo || navigator.userAgent })
        });
        return res.ok;
      }
    } catch {
      // offline
    }
    return false;
  }
}

/**
 * Uploads an image captured on mobile directly to the desktop session.
 */
export async function uploadQRImage(sessionId: string, imageBase64: string, deviceInfo?: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}/upload`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBase64,
        device_info: deviceInfo || 'Mobile Phone Camera'
      })
    });
    return res.ok;
  } catch (err) {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}/upload`;
        const res = await fetch(direct, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageBase64,
            device_info: deviceInfo || 'Mobile Phone Camera'
          })
        });
        return res.ok;
      }
    } catch {
      // offline
    }
    return false;
  }
}

/**
 * Checks session state on desktop to receive uploaded mobile photos.
 */
export async function checkQRSession(sessionId: string): Promise<QRSessionStatus | null> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}`));
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}`;
        const res = await fetch(direct);
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
  }
  return null;
}

/**
 * Analyzes food image via FastAPI backend powered by Google Gemini Vision API.
 * Accurately recognizes dishes, ingredients, portion sizes, and clinical nutrition.
 */
/**
 * Optimizes image size before sending to prevent proxy timeouts and buffer limits
 */
async function compressImageForAnalysis(imageFile: File | string): Promise<string> {
  if (typeof imageFile === 'string' && (!imageFile.startsWith('data:image') || imageFile.length < 400000)) {
    return imageFile;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1024;
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
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      } else {
        resolve(typeof imageFile === 'string' ? imageFile : '');
      }
    };
    img.onerror = () => resolve(typeof imageFile === 'string' ? imageFile : '');

    if (typeof imageFile === 'string') {
      img.src = imageFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = (e.target?.result as string) || ''; };
      reader.readAsDataURL(imageFile);
    }
  });
}

/**
 * Analyzes food image via FastAPI backend powered by Google Gemini Vision API.
 * Accurately recognizes dishes, ingredients, portion sizes, and clinical nutrition.
 */
export async function analyzeFood(
  imageFile: File | string, 
  userId: string = 'user-current',
  titleHint?: string
): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for Gemini Vision

  try {
    const payloadImage = await compressImageForAnalysis(imageFile);
    const bodyJson = JSON.stringify({
      image: payloadImage,
      titleHint: titleHint,
      userId: userId
    });

    // Try primary proxy endpoint first
    let response: Response | null = null;
    let lastNetworkErr: any = null;

    try {
      response = await fetch(getApiUrl('/api/analyze-food'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyJson,
        signal: controller.signal
      });
    } catch (e) {
      lastNetworkErr = e;
    }

    // If proxy failed with 502 Bad Gateway or network failure, failover directly to backend port 8000
    if (!response || response.status === 502 || response.status === 504) {
      if (typeof window !== 'undefined') {
        const directUrl = `http://${window.location.hostname}:8000/api/analyze-food`;
        try {
          response = await fetch(directUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyJson,
            signal: controller.signal
          });
        } catch {
          // keep original response or error
        }
      }
    }

    clearTimeout(timeoutId);

    if (!response) {
      throw new Error(lastNetworkErr?.message || 'Could not connect to NutriVision backend on port 8000.');
    }

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: {
            ...json.data,
            imageUrl: typeof imageFile === 'string' ? imageFile : json.data.imageUrl,
            createdAt: new Date(),
            source: typeof imageFile === 'string' ? 'qr' : 'upload',
          },
          isDemoMode: false
        };
      }
    }
    
    // Extract detailed backend error message if available
    let detailMsg = '';
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        detailMsg = errJson.detail;
      }
    } catch {
      // not JSON
    }

    if (detailMsg) {
      throw new Error(detailMsg);
    }

    if (response.status === 502) {
      throw new Error('Backend server on port 8000 is not responding (HTTP 502). Make sure the FastAPI server is running.');
    }

    if (response.status === 503) {
      throw new Error('Gemini API key is not configured. Please add your GEMINI_API_KEY to backend/.env');
    }

    throw new Error(`Backend returned HTTP ${response.status}`);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Gemini Vision analysis error:', err.message || err);

    return { 
      success: false, 
      error: err.message || 'Gemini Vision analysis could not be completed.'
    };
  }
}

/**
 * Checks Gemini Vision backend configuration status
 */
export async function getBackendStatus(): Promise<{ geminiConfigured: boolean; message: string } | null> {
  try {
    const res = await fetch(getApiUrl('/api/config/status'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/config/status`;
        const res = await fetch(direct, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
  }
  return null;
}

export async function getAlternatives(foodName: string, dietPreference: string): Promise<FoodAnalysis['alternatives']> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return DEMO_ANALYSIS.alternatives;
}

// Nutrition calculation utilities
export function calculateTotalNutrition(foods: Array<{ nutrition: FoodAnalysis['nutrition']; servings: number }>) {
  return foods.reduce((total, { nutrition, servings }) => ({
    calories: total.calories + nutrition.calories * servings,
    protein: total.protein + nutrition.protein * servings,
    carbohydrates: total.carbohydrates + nutrition.carbohydrates * servings,
    fat: total.fat + nutrition.fat * servings,
    fiber: total.fiber + nutrition.fiber * servings,
    vitamins: [],
    minerals: [],
  }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, vitamins: [], minerals: [] });
}

export function scaleNutrition(nutrition: FoodAnalysis['nutrition'], servings: number): FoodAnalysis['nutrition'] {
  return {
    ...nutrition,
    calories: Math.round(nutrition.calories * servings),
    protein: Math.round(nutrition.protein * servings * 10) / 10,
    carbohydrates: Math.round(nutrition.carbohydrates * servings * 10) / 10,
    fat: Math.round(nutrition.fat * servings * 10) / 10,
    fiber: Math.round(nutrition.fiber * servings * 10) / 10,
  };
}

// ─── Native Plugin Utilities ─────────────────────────────────────────────────
//
// This module wraps Capacitor native plugins with web fallbacks.
// On Android/iOS → uses native Camera and Geolocation APIs (high accuracy, instant).
// On Web (browser) → falls back to standard browser APIs.
//
// Usage:
//   import { getNativeLocation, capturePhoto } from '../utils/nativePlugins';
//   const coords = await getNativeLocation();
//   const photo = await capturePhoto();
// ─────────────────────────────────────────────────────────────────────────────

// Detect if running inside Capacitor native shell (Android/iOS)
export const isNative = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
};

// ── GEOLOCATION ──────────────────────────────────────────────────────────────
/**
 * Get the device's current GPS location.
 * On native: uses Capacitor Geolocation (high accuracy, faster cold start).
 * On web: uses browser navigator.geolocation.
 *
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export async function getNativeLocation() {
  if (isNative()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');

      // Request permissions first
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted') {
        throw new Error('Location permission denied. Please enable in device Settings.');
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (err) {
      throw new Error(`Native GPS failed: ${err.message}`);
    }
  }

  // Web fallback
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => reject(new Error(`GPS error: ${err.message}`)),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

// ── CAMERA ───────────────────────────────────────────────────────────────────
/**
 * Open the device camera or photo picker and return a base64 image string.
 * On native: uses Capacitor Camera plugin (instant native camera UI).
 * On web: opens a file input dialog.
 *
 * @returns {Promise<{ base64: string, format: string } | null>}
 */
export async function capturePhoto() {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

      const perm = await Camera.requestPermissions();
      if (perm.camera !== 'granted' && perm.photos !== 'granted') {
        throw new Error('Camera permission denied. Please enable in device Settings.');
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Shows "Camera" or "Gallery" picker to user
      });

      return {
        base64: image.base64String,
        format: image.format, // 'jpeg' or 'png'
        dataUrl: `data:image/${image.format};base64,${image.base64String}`,
      };
    } catch (err) {
      if (err.message?.includes('cancelled') || err.message?.includes('canceled')) {
        return null; // User cancelled — not an error
      }
      throw new Error(`Camera error: ${err.message}`);
    }
  }

  // Web fallback — open file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Rear camera on mobile browsers

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) { resolve(null); return; }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, format: 'jpeg', dataUrl });
      };
      reader.readAsDataURL(file);
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

// ── HAPTIC FEEDBACK ──────────────────────────────────────────────────────────
/**
 * Trigger a haptic vibration (native) or no-op (web).
 * Use for: confirming button taps, success/error states.
 *
 * @param {'light' | 'medium' | 'heavy'} style
 */
export async function hapticFeedback(style = 'light') {
  if (isNative()) {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] || ImpactStyle.Light });
    } catch {
      // Haptics not available — silent fail
    }
  }
  // No-op on web
}

// ── NETWORK STATUS ───────────────────────────────────────────────────────────
/**
 * Check current network connectivity.
 * @returns {Promise<{ connected: boolean, connectionType: string }>}
 */
export async function getNetworkStatus() {
  if (isNative()) {
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      return { connected: status.connected, connectionType: status.connectionType };
    } catch {
      // fallthrough to web
    }
  }
  return { connected: navigator.onLine, connectionType: 'unknown' };
}

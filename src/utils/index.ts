/**
 * Utility exports
 */

export * from './formatTime';
export * from './sourceDetector';

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if we're in SSR environment
 */
export function isSSR(): boolean {
  return !isBrowser();
}

/**
 * Check if fullscreen is supported
 */
export function isFullscreenSupported(): boolean {
  if (!isBrowser()) return false;
  return !!(
    document.fullscreenEnabled ||
    (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
    (document as Document & { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
    (document as Document & { msFullscreenEnabled?: boolean }).msFullscreenEnabled
  );
}

/**
 * Check if Picture-in-Picture is supported
 */
export function isPipSupported(): boolean {
  if (!isBrowser()) return false;
  return 'pictureInPictureEnabled' in document && (document as Document & { pictureInPictureEnabled: boolean }).pictureInPictureEnabled;
}

/**
 * Check if HLS is natively supported (Safari)
 */
export function isHlsNativelySupported(): boolean {
  if (!isBrowser()) return false;
  const video = document.createElement('video');
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'vidflowx'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Parse aspect ratio string to numeric value
 */
export function parseAspectRatio(ratio: string): number {
  const parts = ratio.split(':').map(Number);
  if (parts.length === 2 && parts[0] && parts[1]) {
    return parts[0] / parts[1];
  }
  return 16 / 9; // Default aspect ratio
}

/**
 * Get CSS variable value
 */
export function getCSSVariable(name: string, element?: HTMLElement): string {
  if (!isBrowser()) return '';
  const el = element || document.documentElement;
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/**
 * Set CSS variable value
 */
export function setCSSVariable(name: string, value: string, element?: HTMLElement): void {
  if (!isBrowser()) return;
  const el = element || document.documentElement;
  el.style.setProperty(name, value);
}

/**
 * Merge refs helper for forwarding multiple refs
 */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/**
 * Source Detection Utilities
 * Detects video source type from URL
 */

import type { VideoSource, VideoSourceType, VideoSourceObject } from '../types';

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  /^[a-zA-Z0-9_-]{11}$/, // Just video ID
];

// Vimeo URL patterns
const VIMEO_PATTERNS = [
  /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i,
  /^\d{7,}$/, // Just video ID (Vimeo IDs are typically 7+ digits)
];

// Dailymotion URL patterns
const DAILYMOTION_PATTERNS = [
  /(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i,
];

// Facebook URL patterns
const FACEBOOK_PATTERNS = [
  /facebook\.com\/(?:watch\/?\?v=|.*\/videos\/|video\.php\?v=)(\d+)/i,
  /fb\.watch\/([a-zA-Z0-9]+)/i,
];

// TikTok URL patterns
const TIKTOK_PATTERNS = [
  /tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
  /tiktok\.com\/.*\/video\/(\d+)/i,
];

// HLS pattern
const HLS_PATTERN = /\.m3u8(\?.*)?$/i;

// DASH pattern
const DASH_PATTERN = /\.mpd(\?.*)?$/i;

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  // Check if it's just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  return null;
}

/**
 * Extract video ID from Vimeo URL
 */
export function extractVimeoId(url: string): string | null {
  for (const pattern of VIMEO_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract video ID from Dailymotion URL
 */
export function extractDailymotionId(url: string): string | null {
  for (const pattern of DAILYMOTION_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract video ID from Facebook URL
 */
export function extractFacebookId(url: string): string | null {
  for (const pattern of FACEBOOK_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract video ID from TikTok URL
 */
export function extractTikTokId(url: string): string | null {
  for (const pattern of TIKTOK_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Detect the source type from a URL string
 */
export function detectSourceType(url: string): VideoSourceType {
  // Check for HLS
  if (HLS_PATTERN.test(url)) {
    return 'hls';
  }

  // Check for DASH
  if (DASH_PATTERN.test(url)) {
    return 'dash';
  }

  // Check for YouTube
  if (extractYouTubeId(url)) {
    return 'youtube';
  }

  // Check for Vimeo
  if (extractVimeoId(url)) {
    return 'vimeo';
  }

  // Check for Dailymotion
  if (extractDailymotionId(url)) {
    return 'dailymotion';
  }

  // Check for Facebook
  if (extractFacebookId(url)) {
    return 'facebook';
  }

  // Check for TikTok
  if (extractTikTokId(url)) {
    return 'tiktok';
  }

  // Default to file
  return 'file';
}

/**
 * Parse a VideoSource into a normalized VideoSourceObject
 */
export function parseSource(source: VideoSource): VideoSourceObject {
  if (typeof source === 'string') {
    return {
      type: detectSourceType(source),
      url: source,
    };
  }
  return source;
}

/**
 * Check if a source type uses native HTML5 video element
 */
export function isNativeSource(type: VideoSourceType): boolean {
  return type === 'file' || type === 'hls' || type === 'dash';
}

/**
 * Check if a source type uses an embedded iframe
 */
export function isEmbeddedSource(type: VideoSourceType): boolean {
  return ['youtube', 'vimeo', 'dailymotion', 'facebook', 'tiktok'].includes(type);
}

/**
 * Get the MIME type for a file extension
 */
export function getMimeType(url: string): string {
  const ext = url.match(/\.(\w+)(\?.*)?$/)?.[1]?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    m4v: 'video/mp4',
    m3u8: 'application/x-mpegURL',
    mpd: 'application/dash+xml',
  };

  return mimeTypes[ext || ''] || 'video/mp4';
}

/**
 * Generate YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
  start?: number;
  loop?: boolean;
}): string {
  const params = new URLSearchParams({
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    rel: '0',
    modestbranding: '1',
  });

  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.mute) params.set('mute', '1');
  if (options?.start) params.set('start', String(options.start));
  if (options?.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generate Vimeo embed URL
 */
export function getVimeoEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
}): string {
  const params = new URLSearchParams({
    badge: '0',
    autopause: '0',
    player_id: '0',
  });

  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.mute) params.set('muted', '1');

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

/**
 * Generate Dailymotion embed URL
 */
export function getDailymotionEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
}): string {
  const params = new URLSearchParams({
    api: '1',
  });

  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.mute) params.set('mute', '1');

  return `https://www.dailymotion.com/embed/video/${videoId}?${params.toString()}`;
}

/**
 * Generate Facebook embed URL
 * Facebook uses their plugins/video.php endpoint for embedding
 * Note: Facebook embeds require the video to be public and may not work on localhost
 */
export function getFacebookEmbedUrl(videoUrl: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
  showText?: boolean;
  width?: number;
}): string {
  // Facebook embed URL format
  const encodedUrl = encodeURIComponent(videoUrl);
  const showText = options?.showText ? 'true' : 'false';
  const autoplay = options?.autoplay ? 'true' : 'false';
  const muted = options?.mute ? 'true' : 'false';
  const width = options?.width || 560; // Facebook requires numeric width
  
  return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=${showText}&autoplay=${autoplay}&muted=${muted}&width=${width}`;
}

/**
 * Generate TikTok embed URL
 * TikTok uses their embed player with a specific format
 */
export function getTikTokEmbedUrl(videoId: string): string {
  // TikTok embed v2 format
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

/**
 * Generate TikTok oEmbed HTML (for script-based embedding)
 * This is an alternative approach that requires loading TikTok's embed script
 */
export function getTikTokOEmbedUrl(videoUrl: string): string {
  return `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
}

/**
 * Extract username from TikTok URL
 */
export function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([^\/]+)/i);
  return match ? match[1] : null;
}

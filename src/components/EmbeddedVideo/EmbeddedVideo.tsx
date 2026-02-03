/**
 * EmbeddedVideo Component
 * Handles embedded video players (YouTube, Vimeo, Dailymotion, etc.)
 */

import { useState, useCallback, useMemo } from 'react';
import type { VideoSourceObject } from '../../types';
import {
  extractYouTubeId,
  extractVimeoId,
  extractDailymotionId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
  getDailymotionEmbedUrl,
} from '../../utils/sourceDetector';
import styles from './EmbeddedVideo.module.css';

interface EmbeddedVideoProps {
  source: VideoSourceObject;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onReady?: () => void;
  onPlay?: () => void;
}

export function EmbeddedVideo({
  source,
  autoPlay = false,
  muted = false,
  loop = false,
  onReady,
  onPlay,
}: EmbeddedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!autoPlay);

  const handleLoadClick = useCallback(() => {
    setShowPlaceholder(false);
    onPlay?.();
  }, [onPlay]);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    onReady?.();
  }, [onReady]);

  // Generate embed URL based on source type
  const embedData = useMemo(() => {
    const { type, url } = source;

    switch (type) {
      case 'youtube': {
        const videoId = extractYouTubeId(url);
        if (!videoId) return null;
        return {
          embedUrl: getYouTubeEmbedUrl(videoId, { autoplay: autoPlay, mute: muted, loop }),
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: 'YouTube Video',
        };
      }
      case 'vimeo': {
        const videoId = extractVimeoId(url);
        if (!videoId) return null;
        return {
          embedUrl: getVimeoEmbedUrl(videoId, { autoplay: autoPlay, mute: muted }),
          thumbnailUrl: '', // Vimeo requires API call for thumbnail
          title: 'Vimeo Video',
        };
      }
      case 'dailymotion': {
        const videoId = extractDailymotionId(url);
        if (!videoId) return null;
        return {
          embedUrl: getDailymotionEmbedUrl(videoId, { autoplay: autoPlay, mute: muted }),
          thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${videoId}`,
          title: 'Dailymotion Video',
        };
      }
      case 'facebook': {
        // Facebook requires special handling with their SDK
        const encodedUrl = encodeURIComponent(url);
        return {
          embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=${autoPlay}`,
          thumbnailUrl: '',
          title: 'Facebook Video',
        };
      }
      case 'tiktok': {
        // TikTok embed is limited
        return {
          embedUrl: url,
          thumbnailUrl: '',
          title: 'TikTok Video',
        };
      }
      default:
        return null;
    }
  }, [source, autoPlay, muted, loop]);

  if (!embedData) {
    return (
      <div className={styles.error}>
        <p>Unable to load video from this source</p>
      </div>
    );
  }

  // Show lazy loading placeholder
  if (showPlaceholder) {
    return (
      <div className={styles.placeholder} onClick={handleLoadClick}>
        {embedData.thumbnailUrl && (
          <img
            src={embedData.thumbnailUrl}
            alt={embedData.title}
            className={styles.thumbnail}
            loading="lazy"
          />
        )}
        <button className={styles.playButton} aria-label="Load and play video">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div className={styles.platformBadge}>
          {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!isLoaded && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      )}
      <iframe
        src={embedData.embedUrl}
        title={embedData.title}
        className={`${styles.iframe} ${isLoaded ? styles.visible : ''}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
      />
    </div>
  );
}

EmbeddedVideo.displayName = 'EmbeddedVideo';

export default EmbeddedVideo;

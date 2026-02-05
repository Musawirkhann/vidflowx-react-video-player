/**
 * EmbeddedVideo Component
 * Handles embedded video players (YouTube, Vimeo, Dailymotion, etc.)
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { VideoSourceObject } from '../../types';
import {
  extractYouTubeId,
  extractVimeoId,
  extractDailymotionId,
  extractTikTokId,
  extractTikTokUsername,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
  getDailymotionEmbedUrl,
  getFacebookEmbedUrl,
  getTikTokEmbedUrl,
} from '../../utils/sourceDetector';
import styles from './EmbeddedVideo.module.css';

// Declare TikTok global for TypeScript
declare global {
  interface Window {
    tiktokEmbed?: {
      lib: {
        render: (elements: NodeListOf<Element>) => void;
      };
    };
  }
}

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
  const [embedError, setEmbedError] = useState(false);
  const tiktokContainerRef = useRef<HTMLDivElement>(null);
  const facebookContainerRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleLoadClick = useCallback(() => {
    setShowPlaceholder(false);
    onPlay?.();
  }, [onPlay]);

  const handleIframeLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoaded(true);
    onReady?.();
  }, [onReady]);

  const handleIframeError = useCallback(() => {
    setEmbedError(true);
  }, []);

  // Load TikTok embed script
  useEffect(() => {
    if (source.type === 'tiktok' && !showPlaceholder) {
      const existingScript = document.querySelector('script[src*="tiktok.com/embed.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        script.onload = () => {
          setIsLoaded(true);
          onReady?.();
        };
        script.onerror = () => {
          // Script failed to load - this is expected in some environments
          setIsLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        // Script already exists, try to re-render if tiktokEmbed is available
        try {
          if (window.tiktokEmbed?.lib?.render) {
            const elements = tiktokContainerRef.current?.querySelectorAll('.tiktok-embed');
            if (elements && elements.length > 0) {
              window.tiktokEmbed.lib.render(elements);
            }
          }
        } catch {
          // Ignore errors if tiktokEmbed is not fully initialized
        }
        setIsLoaded(true);
        onReady?.();
      }
    }
  }, [source.type, showPlaceholder, onReady]);

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
        return {
          embedUrl: getFacebookEmbedUrl(url, { autoplay: autoPlay, mute: muted }),
          thumbnailUrl: '',
          title: 'Facebook Video',
          originalUrl: url,
        };
      }
      case 'tiktok': {
        const videoId = extractTikTokId(url);
        const username = extractTikTokUsername(url);
        if (!videoId) return null;
        return {
          embedUrl: getTikTokEmbedUrl(videoId),
          thumbnailUrl: '',
          title: 'TikTok Video',
          videoId,
          username: username || 'user',
          originalUrl: url,
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

  // Show fallback for embed errors
  if (embedError) {
    return (
      <div className={styles.fallback}>
        <div className={styles.fallbackContent}>
          <div className={styles.platformIcon} data-platform={source.type}>
            {source.type.charAt(0).toUpperCase()}
          </div>
          <p className={styles.fallbackText}>
            This {source.type.charAt(0).toUpperCase() + source.type.slice(1)} video cannot be embedded here.
          </p>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fallbackLink}
          >
            Watch on {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
          </a>
        </div>
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
          <span
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>' }}
          />
        </button>
        <div className={styles.platformBadge} data-platform={source.type}>
          {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
        </div>
      </div>
    );
  }

  // Render Facebook with iframe
  // Note: Facebook embeds require a public domain (not localhost) and the video must be publicly embeddable
  if (source.type === 'facebook' && embedData.originalUrl) {
    return (
      <div className={styles.container} ref={facebookContainerRef}>
        {!isLoaded && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        )}
        <iframe
          src={embedData.embedUrl}
          title={embedData.title}
          className={`${styles.iframe} ${isLoaded ? styles.visible : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          scrolling="no"
          frameBorder="0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    );
  }

  // Render TikTok with iframe for full height display
  if (source.type === 'tiktok' && embedData.videoId) {
    return (
      <div className={styles.tiktokContainer} ref={tiktokContainerRef}>
        {!isLoaded && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        )}
        <iframe
          src={embedData.embedUrl}
          title={embedData.title}
          className={`${styles.tiktokIframe} ${isLoaded ? styles.visible : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          scrolling="no"
          frameBorder="0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        scrolling="no"
        frameBorder="0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
}

EmbeddedVideo.displayName = 'EmbeddedVideo';

export default EmbeddedVideo;

/**
 * NativeVideo Component
 * Handles native HTML5 video, HLS, and DASH playback
 */

import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import type { VideoSourceType, CaptionTrack } from '../../types';
import { isHlsNativelySupported } from '../../utils';
import styles from './NativeVideo.module.css';

interface NativeVideoProps {
  src: string;
  sourceType: VideoSourceType;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  crossOrigin?: 'anonymous' | 'use-credentials';
  playsInline?: boolean;
  captions?: CaptionTrack[];
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: () => void;
  onDurationChange?: () => void;
  onProgress?: () => void;
  onWaiting?: () => void;
  onPlaying?: () => void;
  onVolumeChange?: () => void;
  onRateChange?: () => void;
  onSeeking?: () => void;
  onSeeked?: () => void;
  onLoadedMetadata?: () => void;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onError?: (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

export const NativeVideo = forwardRef<HTMLVideoElement, NativeVideoProps>(
  (
    {
      src,
      sourceType,
      poster,
      autoPlay = false,
      loop = false,
      muted = false,
      preload = 'metadata',
      crossOrigin,
      playsInline = true,
      captions = [],
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onDurationChange,
      onProgress,
      onWaiting,
      onPlaying,
      onVolumeChange,
      onRateChange,
      onSeeking,
      onSeeked,
      onLoadedMetadata,
      onLoadedData,
      onCanPlay,
      onError,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<import('hls.js').default | null>(null);
    const dashRef = useRef<import('dashjs').MediaPlayerClass | null>(null);

    // Get the actual video element
    const getVideoElement = useCallback(() => {
      if (typeof ref === 'function') {
        return internalRef.current;
      }
      return (ref as React.RefObject<HTMLVideoElement>)?.current || internalRef.current;
    }, [ref]);

    // Initialize HLS.js
    const initHls = useCallback(async () => {
      const video = getVideoElement();
      if (!video) return;

      // Clean up existing instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Check if native HLS is supported (Safari)
      if (isHlsNativelySupported()) {
        video.src = src;
        return;
      }

      // Dynamically import HLS.js
      try {
        const Hls = (await import('hls.js')).default;

        if (!Hls.isSupported()) {
          console.error('HLS.js is not supported in this browser');
          return;
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(() => {
              // Autoplay was prevented
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } catch (error) {
        console.error('Failed to load HLS.js:', error);
      }
    }, [src, autoPlay, getVideoElement]);

    // Initialize DASH.js
    const initDash = useCallback(async () => {
      const video = getVideoElement();
      if (!video) return;

      // Clean up existing instance
      if (dashRef.current) {
        dashRef.current.reset();
        dashRef.current = null;
      }

      try {
        const dashjs = await import('dashjs');
        const player = dashjs.MediaPlayer().create();

        player.initialize(video, src, autoPlay);
        player.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: {
                video: true,
                audio: true,
              },
            },
          },
        });

        dashRef.current = player;
      } catch (error) {
        console.error('Failed to load dash.js:', error);
      }
    }, [src, autoPlay, getVideoElement]);

    // Handle source type changes
    useEffect(() => {
      if (!src) return;

      // Clean up previous instances
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (dashRef.current) {
        dashRef.current.reset();
        dashRef.current = null;
      }

      if (sourceType === 'hls') {
        initHls();
      } else if (sourceType === 'dash') {
        initDash();
      } else {
        // Direct file source
        const video = getVideoElement();
        if (video) {
          video.src = src;
        }
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        if (dashRef.current) {
          dashRef.current.reset();
          dashRef.current = null;
        }
      };
    }, [src, sourceType, initHls, initDash, getVideoElement]);

    // Merge refs
    const setRefs = useCallback(
      (element: HTMLVideoElement | null) => {
        (internalRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLVideoElement | null>).current = element;
        }
      },
      [ref]
    );

    return (
      <video
        ref={setRefs}
        className={styles.video}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        preload={preload}
        crossOrigin={crossOrigin}
        playsInline={playsInline}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onProgress={onProgress}
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        onVolumeChange={onVolumeChange}
        onRateChange={onRateChange}
        onSeeking={onSeeking}
        onSeeked={onSeeked}
        onLoadedMetadata={onLoadedMetadata}
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onError={onError}
      >
        {/* Caption tracks */}
        {captions.map((caption, index) => (
          <track
            key={`${caption.lang}-${index}`}
            kind="subtitles"
            src={caption.src}
            srcLang={caption.lang}
            label={caption.label || caption.lang}
            default={caption.default}
          />
        ))}
      </video>
    );
  }
);

NativeVideo.displayName = 'NativeVideo';

export default NativeVideo;

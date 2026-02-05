/**
 * VideoPlayer Component
 * Main video player component with full customization support
 */

import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import type {
  VideoPlayerProps,
  VideoPlayerRef,
  AnalyticsEventData,
  SeekEventData,
  BufferEventData,
  ErrorEventData,
} from '../../types';
import { useVideoState } from '../../hooks/useVideoState';
import { useVideoActions } from '../../hooks/useVideoActions';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useControlsVisibility } from '../../hooks/useControlsVisibility';
import { VideoPlayerProvider } from '../../providers/VideoPlayerContext';
import { parseSource, isNativeSource } from '../../utils/sourceDetector';
import { NativeVideo } from '../NativeVideo/NativeVideo';
import { EmbeddedVideo } from '../EmbeddedVideo/EmbeddedVideo';
import { BigPlayIcon } from '../Icons';
import { Controls } from '../Controls/Controls';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import styles from './VideoPlayer.module.css';

const DEFAULT_PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (props, ref) => {
    const {
      src,
      autoPlay = false,
      loop = false,
      muted = false,
      preload = 'metadata',
      poster,
      volume: initialVolume = 1,
      playbackRate: initialPlaybackRate = 1,
      startTime = 0,
      crossOrigin,
      playsInline = true,
      controls = true,
      controlsAutoHide = 3000, // Auto-hide controls after 3s of inactivity when playing
      keyboardShortcuts = true,
      seekStep = 10,
      playbackSpeeds = DEFAULT_PLAYBACK_SPEEDS,
      captions = [],
      chapters = [],
      playlist,
      theme,
      className,
      style,
      width,
      height,
      aspectRatio = '16:9',
      responsive = true,
      hoverPreview = false,
      hoverPreviewSrc,
      hoverPreviewCount,
      // miniPlayer - reserved for future implementation
      miniPlayer: _miniPlayer,
      onPlay,
      onPause,
      onEnded,
      onSeek,
      onTimeUpdate,
      onBuffer,
      onBufferEnd,
      onError,
      onLoad,
      onDurationChange,
      onVolumeChange,
      onPlaybackRateChange,
      onEnterFullscreen,
      onExitFullscreen,
      onEnterPip,
      onExitPip,
      onReady,
      components,
      plugins = [],
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      tabIndex = 0,
    } = props;

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const previousTimeRef = useRef<number>(0);

    // State management
    const stateManager = useVideoState({
      initialVolume,
      initialMuted: muted,
      initialPlaybackRate,
    });

    const { state } = stateManager;

    // Actions
    const actions = useVideoActions({
      stateManager,
      videoRef,
      containerRef,
      seekStep,
      playlist,
    });

    // Memoized visibility change handler
    const handleControlsVisibilityChange = useCallback((visible: boolean) => {
      stateManager.setControlsVisible(visible);
    }, [stateManager]);

    // Controls visibility
    const {
      isVisible: controlsVisible,
      handlers: controlsHandlers,
    } = useControlsVisibility({
      hideDelay: controlsAutoHide,
      enabled: controlsAutoHide > 0,
      isPlaying: state.isPlaying,
      onVisibilityChange: handleControlsVisibilityChange,
    });

    // Keyboard shortcuts
    useKeyboardShortcuts({
      enabled: typeof keyboardShortcuts === 'boolean' ? keyboardShortcuts : true,
      shortcuts: typeof keyboardShortcuts === 'object' ? keyboardShortcuts : undefined,
      actions,
      containerRef,
      seekStep,
      getCurrentVolume: () => state.volume,
    });

    // Parse source
    const parsedSource = useMemo(() => {
      if (!src) return null;
      return parseSource(src);
    }, [src]);

    const isNative = parsedSource ? isNativeSource(parsedSource.type) : true;

    // Create analytics event data
    const createEventData = useCallback((): AnalyticsEventData => ({
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      muted: state.isMuted,
      playbackRate: state.playbackRate,
      source: src,
      isFullscreen: state.isFullscreen,
      quality: state.quality ?? undefined,
    }), [state, src]);

    // Video event handlers
    const handlePlay = useCallback(() => {
      stateManager.setPlaybackState('playing');
      onPlay?.(createEventData());
    }, [stateManager, onPlay, createEventData]);

    const handlePause = useCallback(() => {
      stateManager.setPlaybackState('paused');
      onPause?.(createEventData());
    }, [stateManager, onPause, createEventData]);

    const handleEnded = useCallback(() => {
      stateManager.setPlaybackState('ended');
      onEnded?.(createEventData());

      // Handle playlist auto-next
      if (playlist?.autoPlayNext) {
        actions.nextTrack();
      }
    }, [stateManager, onEnded, createEventData, playlist, actions]);

    const handleTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      stateManager.setCurrentTime(video.currentTime);
      onTimeUpdate?.(createEventData());
    }, [stateManager, onTimeUpdate, createEventData]);

    const handleDurationChange = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      stateManager.setDuration(video.duration);
      onDurationChange?.(createEventData());
    }, [stateManager, onDurationChange, createEventData]);

    const handleProgress = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      stateManager.setBuffered(video.buffered);
    }, [stateManager]);

    const handleWaiting = useCallback(() => {
      stateManager.setPlaybackState('buffering');
      const bufferData: BufferEventData = {
        ...createEventData(),
        buffered: state.buffered,
        bufferedPercent: state.bufferedPercent,
      };
      onBuffer?.(bufferData);
    }, [stateManager, onBuffer, createEventData, state.buffered, state.bufferedPercent]);

    const handlePlaying = useCallback(() => {
      stateManager.setPlaybackState('playing');
      onBufferEnd?.(createEventData());
    }, [stateManager, onBufferEnd, createEventData]);

    const handleVolumeChange = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      stateManager.setVolume(video.volume);
      stateManager.setMuted(video.muted);
      onVolumeChange?.(createEventData());
    }, [stateManager, onVolumeChange, createEventData]);

    const handleRateChange = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      stateManager.setPlaybackRate(video.playbackRate);
      onPlaybackRateChange?.(createEventData());
    }, [stateManager, onPlaybackRateChange, createEventData]);

    const handleSeeking = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      const seekData: SeekEventData = {
        ...createEventData(),
        fromTime: previousTimeRef.current,
        toTime: video.currentTime,
      };
      onSeek?.(seekData);
    }, [onSeek, createEventData]);

    const handleSeeked = useCallback(() => {
      const video = videoRef.current;
      if (video) {
        previousTimeRef.current = video.currentTime;
      }
    }, []);

    const handleLoadedMetadata = useCallback(() => {
      // Video metadata is available, update duration
      const video = videoRef.current;
      if (video) {
        stateManager.setDuration(video.duration);
        // Only update loading state, let handlePlay/handlePause manage playback state
        stateManager.updateStateMultiple({
          isLoading: false,
        });

        // Enable default caption track if one exists
        if (captions.length > 0) {
          const defaultCaptionIndex = captions.findIndex((c) => c.default);
          if (defaultCaptionIndex >= 0 && video.textTracks.length > 0) {
            // Wait for text tracks to be loaded
            setTimeout(() => {
              const tracks = video.textTracks;
              for (let i = 0; i < tracks.length; i++) {
                tracks[i].mode = i === defaultCaptionIndex ? 'showing' : 'hidden';
              }
              stateManager.setActiveCaption(defaultCaptionIndex);
            }, 100);
          }
        }
      }
    }, [stateManager, captions]);

    const handleLoadedData = useCallback(() => {
      // Video first frame is available, ready to play
      // Only update loading state, let handlePlay/handlePause manage playback state
      stateManager.updateStateMultiple({
        isLoading: false,
      });
      onLoad?.(createEventData());
    }, [stateManager, onLoad, createEventData]);

    const handleCanPlay = useCallback(() => {
      // Video can start playing - ensure loading is false
      // Only update loading state, let handlePlay/handlePause manage playback state
      stateManager.updateStateMultiple({
        isLoading: false,
      });
      onReady?.(createEventData());
    }, [stateManager, onReady, createEventData]);

    const handleError = useCallback((event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const video = event.currentTarget;
      const error = video.error;
      const errorObj = new Error(error?.message || 'Unknown video error');
      
      stateManager.setError(errorObj);
      
      const errorData: ErrorEventData = {
        error: errorObj,
        code: error?.code,
        source: src,
      };
      onError?.(errorData);
    }, [stateManager, onError, src]);

    // Fullscreen change handler
    useEffect(() => {
      const handleFullscreenChange = () => {
        const isFullscreen = !!(
          document.fullscreenElement ||
          (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
          (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
          (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
        );
        
        stateManager.setFullscreen(isFullscreen);
        
        if (isFullscreen) {
          onEnterFullscreen?.(createEventData());
        } else {
          onExitFullscreen?.(createEventData());
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }, [stateManager, onEnterFullscreen, onExitFullscreen, createEventData]);

    // PiP change handler
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleEnterPiP = () => {
        stateManager.setPip(true);
        onEnterPip?.(createEventData());
      };

      const handleLeavePiP = () => {
        stateManager.setPip(false);
        onExitPip?.(createEventData());
      };

      video.addEventListener('enterpictureinpicture', handleEnterPiP);
      video.addEventListener('leavepictureinpicture', handleLeavePiP);

      return () => {
        video.removeEventListener('enterpictureinpicture', handleEnterPiP);
        video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      };
    }, [stateManager, onEnterPip, onExitPip, createEventData]);

    // Set source when it changes
    // Note: Only depend on src, not stateManager, to avoid running on every render
    useEffect(() => {
      if (src) {
        stateManager.setSource(src);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    // Handle start time
    useEffect(() => {
      const video = videoRef.current;
      if (video && startTime > 0) {
        video.currentTime = startTime;
      }
    }, [startTime, src]);

    // Initialize plugins
    useEffect(() => {
      plugins.forEach((plugin) => {
        plugin.onInit?.({
          state,
          actions,
          videoElement: videoRef.current,
          containerElement: containerRef.current,
        });
      });

      return () => {
        plugins.forEach((plugin) => {
          plugin.onDestroy?.({
            state,
            actions,
            videoElement: videoRef.current,
            containerElement: containerRef.current,
          });
        });
      };
    }, [plugins, state, actions]);

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      ...actions,
      getState: () => stateManager.getState(),
      getVideoElement: () => videoRef.current,
      getContainerElement: () => containerRef.current,
    }), [actions, stateManager]);

    // Compute container styles
    const containerStyles = useMemo(() => {
      const baseStyles: React.CSSProperties = { ...style };

      if (width) {
        baseStyles.width = typeof width === 'number' ? `${width}px` : width;
      }

      if (height) {
        baseStyles.height = typeof height === 'number' ? `${height}px` : height;
      }

      if (!height && aspectRatio && responsive) {
        const [w, h] = aspectRatio.split(':').map(Number);
        baseStyles.aspectRatio = `${w}/${h}`;
      }

      // Apply theme CSS variables
      if (theme?.colors) {
        const colorVars: Record<string, string> = {};
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (value) {
            colorVars[`--vidflowx-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
          }
        });
        Object.assign(baseStyles, colorVars);
      }

      return baseStyles;
    }, [style, width, height, aspectRatio, responsive, theme]);

    // Determine controls config
    const showControls = controls !== false;
    const controlsConfig = typeof controls === 'object' ? controls : {};

    // Custom components
    const LoadingComponent = components?.LoadingIndicator || LoadingIndicator;
    const ErrorComponent = components?.ErrorDisplay || ErrorDisplay;

    return (
      <VideoPlayerProvider state={state} actions={actions} props={props}>
        <div
          ref={containerRef}
          className={`${styles.container} ${className || ''} ${
            state.isFullscreen ? styles.fullscreen : ''
          } ${theme?.mode === 'light' ? styles.light : styles.dark} ${
            state.isPlaying && !controlsVisible ? styles.hideCursor : ''
          }`}
          style={containerStyles}
          tabIndex={tabIndex}
          role="application"
          aria-label={ariaLabel || 'Video Player'}
          aria-describedby={ariaDescribedBy}
          data-theme={theme?.mode === 'light' ? 'light' : 'dark'}
          {...controlsHandlers}
        >
          {/* Video Element */}
          {isNative ? (
            <NativeVideo
              ref={videoRef}
              src={parsedSource?.url || ''}
              sourceType={parsedSource?.type || 'file'}
              poster={poster}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              preload={preload}
              crossOrigin={crossOrigin}
              playsInline={playsInline}
              captions={captions}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onProgress={handleProgress}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onVolumeChange={handleVolumeChange}
              onRateChange={handleRateChange}
              onSeeking={handleSeeking}
              onSeeked={handleSeeked}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadedData={handleLoadedData}
              onCanPlay={handleCanPlay}
              onError={handleError}
            />
          ) : (
            <EmbeddedVideo
              source={parsedSource!}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              onReady={() => {
                stateManager.setPlaybackState('paused');
              }}
              onPlay={() => {
                stateManager.setPlaybackState('playing');
              }}
            />
          )}

          {/* Loading Indicator - only show when buffering during playback */}
          {state.isBuffering && isNative && (
            <LoadingComponent state={state} actions={actions} />
          )}

          {/* Error Display */}
          {state.error && (
            <ErrorComponent state={state} actions={actions} error={state.error} />
          )}

          {/* Controls - only show for native video sources */}
          <AnimatePresence>
            {showControls && controlsVisible && !state.error && isNative && (
              <Controls
                config={controlsConfig}
                playbackSpeeds={playbackSpeeds}
                chapters={chapters}
                captions={captions}
                hoverPreview={hoverPreview}
                hoverPreviewSrc={hoverPreviewSrc}
                hoverPreviewCount={hoverPreviewCount}
                components={components}
                themeMode={theme?.mode === 'light' ? 'light' : 'dark'}
              />
            )}
          </AnimatePresence>

          {/* Big Play Button (shown when paused or idle, only for native video) */}
          {isNative && !state.isPlaying && !state.isBuffering && !state.error && (
            components?.BigPlayButton ? (
              <components.BigPlayButton state={state} actions={actions} />
            ) : (
              <button
                className={styles.bigPlayButton}
                onClick={() => actions.play()}
                aria-label="Play video"
              >
                <BigPlayIcon />
              </button>
            )
          )}

          {/* Plugin Overlays */}
          {plugins.map((plugin) =>
            plugin.render?.({
              state,
              actions,
              videoElement: videoRef.current,
              containerElement: containerRef.current,
            })
          )}
        </div>
      </VideoPlayerProvider>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

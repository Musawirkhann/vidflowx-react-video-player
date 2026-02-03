/**
 * Controls Component
 * Video player control bar with all playback controls
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ControlsConfig, Chapter, CaptionTrack, ComponentOverrides } from '../../types';
import { useVideoPlayerContext } from '../../providers/VideoPlayerContext';
import { formatTime } from '../../utils/formatTime';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { VolumeControl } from '../VolumeControl/VolumeControl';
import styles from './Controls.module.css';

interface ControlsProps {
  config: ControlsConfig;
  playbackSpeeds: number[];
  chapters?: Chapter[];
  captions?: CaptionTrack[];
  hoverPreview?: boolean;
  hoverPreviewSrc?: string;
  hoverPreviewCount?: number;
  components?: ComponentOverrides;
}

export function Controls({
  config,
  playbackSpeeds,
  chapters = [],
  captions = [],
  hoverPreview,
  hoverPreviewSrc,
  hoverPreviewCount,
  components,
}: ControlsProps) {
  const { state, actions } = useVideoPlayerContext();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showCaptionsMenu, setShowCaptionsMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const captionsMenuRef = useRef<HTMLDivElement>(null);

  // Determine which controls to show
  const showPlay = config.play !== false;
  const showProgress = config.progress !== false;
  const showTime = config.currentTime !== false || config.duration !== false;
  const showVolume = config.volume !== false;
  const showSpeed = config.playbackSpeed !== false;
  const showFullscreen = config.fullscreen !== false;
  const showPip = config.pip !== false;
  const showCaptions = config.captions !== false && captions.length > 0;

  // Toggle speed menu
  const handleSpeedClick = useCallback(() => {
    setShowSpeedMenu(!showSpeedMenu);
    setShowCaptionsMenu(false);
  }, [showSpeedMenu]);

  // Set playback speed
  const handleSpeedSelect = useCallback((speed: number) => {
    actions.setPlaybackRate(speed);
    setShowSpeedMenu(false);
  }, [actions]);

  // Toggle captions menu
  const handleCaptionsClick = useCallback(() => {
    setShowCaptionsMenu(!showCaptionsMenu);
    setShowSpeedMenu(false);
  }, [showCaptionsMenu]);

  // Set active caption
  const handleCaptionSelect = useCallback((index: number) => {
    actions.setActiveCaption(index);
    setShowCaptionsMenu(false);
  }, [actions]);

  // Custom components
  const PlayPauseButton = state.isPlaying 
    ? components?.PauseButton 
    : components?.PlayButton;

  return (
    <motion.div
      className={styles.controls}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Progress bar */}
      {showProgress && (
        components?.ProgressBar ? (
          <components.ProgressBar state={state} actions={actions} />
        ) : (
          <ProgressBar
            chapters={chapters}
            hoverPreview={hoverPreview}
            hoverPreviewSrc={hoverPreviewSrc}
            hoverPreviewCount={hoverPreviewCount}
          />
        )
      )}

      {/* Control buttons row */}
      <div className={styles.controlsRow}>
        {/* Left controls */}
        <div className={styles.leftControls}>
          {/* Play/Pause */}
          {showPlay && (
            PlayPauseButton ? (
              <PlayPauseButton state={state} actions={actions} />
            ) : (
              <button
                className={styles.controlButton}
                onClick={() => actions.togglePlay()}
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                {state.isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            )
          )}

          {/* Skip backward */}
          <button
            className={styles.controlButton}
            onClick={() => actions.seekBackward()}
            aria-label="Seek backward 10 seconds"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              <text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Skip forward */}
          <button
            className={styles.controlButton}
            onClick={() => actions.seekForward()}
            aria-label="Seek forward 10 seconds"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
              <text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Volume */}
          {showVolume && (
            components?.VolumeControl ? (
              <components.VolumeControl state={state} actions={actions} />
            ) : (
              <VolumeControl />
            )
          )}

          {/* Time display */}
          {showTime && (
            components?.TimeDisplay ? (
              <components.TimeDisplay state={state} actions={actions} />
            ) : (
              <div className={styles.timeDisplay}>
                <span>{formatTime(state.currentTime)}</span>
                <span className={styles.timeSeparator}>/</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            )
          )}
        </div>

        {/* Right controls */}
        <div className={styles.rightControls}>
          {/* Playback speed */}
          {showSpeed && (
            <div className={styles.menuContainer} ref={speedMenuRef}>
              <button
                className={styles.controlButton}
                onClick={handleSpeedClick}
                aria-label="Playback speed"
                aria-expanded={showSpeedMenu}
              >
                <span className={styles.speedLabel}>{state.playbackRate}x</span>
              </button>
              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    className={styles.menu}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        className={`${styles.menuItem} ${
                          state.playbackRate === speed ? styles.active : ''
                        }`}
                        onClick={() => handleSpeedSelect(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Captions */}
          {showCaptions && (
            <div className={styles.menuContainer} ref={captionsMenuRef}>
              <button
                className={`${styles.controlButton} ${
                  state.activeCaptionIndex >= 0 ? styles.active : ''
                }`}
                onClick={handleCaptionsClick}
                aria-label="Captions"
                aria-expanded={showCaptionsMenu}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
                </svg>
              </button>
              <AnimatePresence>
                {showCaptionsMenu && (
                  <motion.div
                    className={styles.menu}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      className={`${styles.menuItem} ${
                        state.activeCaptionIndex === -1 ? styles.active : ''
                      }`}
                      onClick={() => handleCaptionSelect(-1)}
                    >
                      Off
                    </button>
                    {captions.map((caption, index) => (
                      <button
                        key={`${caption.lang}-${index}`}
                        className={`${styles.menuItem} ${
                          state.activeCaptionIndex === index ? styles.active : ''
                        }`}
                        onClick={() => handleCaptionSelect(index)}
                      >
                        {caption.label || caption.lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Picture-in-Picture */}
          {showPip && (
            components?.PipButton ? (
              <components.PipButton state={state} actions={actions} />
            ) : (
              <button
                className={`${styles.controlButton} ${state.isPip ? styles.active : ''}`}
                onClick={() => actions.togglePip()}
                aria-label={state.isPip ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                </svg>
              </button>
            )
          )}

          {/* Fullscreen */}
          {showFullscreen && (
            components?.FullscreenButton ? (
              <components.FullscreenButton state={state} actions={actions} />
            ) : (
              <button
                className={styles.controlButton}
                onClick={() => actions.toggleFullscreen()}
                aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {state.isFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

Controls.displayName = 'Controls';

export default Controls;

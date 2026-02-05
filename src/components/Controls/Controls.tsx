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
import {
  PlayIcon,
  PauseIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
  CaptionsIcon,
  PipIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from '../Icons';
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
  themeMode?: 'light' | 'dark';
}

export function Controls({
  config,
  playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2],
  chapters = [],
  captions = [],
  hoverPreview,
  hoverPreviewSrc,
  hoverPreviewCount,
  components,
  themeMode = 'dark',
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
      className={`${styles.controls} ${themeMode === 'light' ? styles.light : ''}`}
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
                {state.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            )
          )}

          {/* Skip backward */}
          <button
            className={styles.controlButton}
            onClick={() => actions.seekBackward()}
            aria-label="Seek backward 10 seconds"
          >
            <SkipBackwardIcon />
          </button>

          {/* Skip forward */}
          <button
            className={styles.controlButton}
            onClick={() => actions.seekForward()}
            aria-label="Seek forward 10 seconds"
          >
            <SkipForwardIcon />
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
                    {Array.isArray(playbackSpeeds) && playbackSpeeds.map((speed) => (
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
                <CaptionsIcon />
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
                <PipIcon />
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
                {state.isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
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

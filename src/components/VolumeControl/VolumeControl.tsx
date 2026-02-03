/**
 * VolumeControl Component
 * Volume slider with mute toggle
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayerContext } from '../../providers/VideoPlayerContext';
import styles from './VolumeControl.module.css';

export function VolumeControl() {
  const { state, actions } = useVideoPlayerContext();
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const previousVolumeRef = useRef(state.volume);

  // Get volume icon based on current volume
  const getVolumeIcon = () => {
    if (state.isMuted || state.volume === 0) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      );
    }
    if (state.volume < 0.5) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    );
  };

  // Handle mute toggle
  const handleMuteClick = useCallback(() => {
    if (state.isMuted) {
      actions.unmute();
      if (state.volume === 0) {
        actions.setVolume(previousVolumeRef.current || 0.5);
      }
    } else {
      previousVolumeRef.current = state.volume;
      actions.mute();
    }
  }, [state.isMuted, state.volume, actions]);

  // Calculate volume from position
  const getVolumeFromEvent = useCallback(
    (event: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent): number => {
      const slider = sliderRef.current;
      if (!slider) return state.volume;

      const rect = slider.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, position));
    },
    [state.volume]
  );

  // Handle slider click
  const handleSliderClick = useCallback(
    (event: React.MouseEvent) => {
      const volume = getVolumeFromEvent(event);
      actions.setVolume(volume);
    },
    [getVolumeFromEvent, actions]
  );

  // Handle drag start
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      setIsDragging(true);
      const volume = getVolumeFromEvent(event);
      actions.setVolume(volume);

      const handleMouseMove = (e: MouseEvent) => {
        const vol = getVolumeFromEvent(e);
        actions.setVolume(vol);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [getVolumeFromEvent, actions]
  );

  // Handle keyboard
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const step = 0.1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        actions.setVolume(Math.min(1, state.volume + step));
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        actions.setVolume(Math.max(0, state.volume - step));
      }
    },
    [actions, state.volume]
  );

  const showSlider = isHovering || isDragging;
  const displayVolume = state.isMuted ? 0 : state.volume;

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        className={styles.muteButton}
        onClick={handleMuteClick}
        aria-label={state.isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            className={styles.sliderContainer}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              ref={sliderRef}
              className={styles.slider}
              onClick={handleSliderClick}
              onMouseDown={handleMouseDown}
              onKeyDown={handleKeyDown}
              role="slider"
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(displayVolume * 100)}
              tabIndex={0}
            >
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${displayVolume * 100}%` }}
                />
              </div>
              <div
                className={styles.handle}
                style={{ left: `${displayVolume * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

VolumeControl.displayName = 'VolumeControl';

export default VolumeControl;

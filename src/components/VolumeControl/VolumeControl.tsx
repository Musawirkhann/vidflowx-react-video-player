/**
 * VolumeControl Component
 * Volume slider with mute toggle
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayerContext } from '../../providers/VideoPlayerContext';
import { VolumeMutedIcon, VolumeLowIcon, VolumeHighIcon } from '../Icons';
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
      return <VolumeMutedIcon />;
    }
    if (state.volume < 0.5) {
      return <VolumeLowIcon />;
    }
    return <VolumeHighIcon />;
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

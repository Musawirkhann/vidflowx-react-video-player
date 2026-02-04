/**
 * ProgressBar Component
 * Seekable progress bar with buffer indicator and optional chapter markers
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Chapter } from '../../types';
import { useVideoPlayerContext } from '../../providers/VideoPlayerContext';
import { formatTime } from '../../utils/formatTime';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  chapters?: Chapter[];
  hoverPreview?: boolean;
  hoverPreviewSrc?: string;
  hoverPreviewCount?: number;
}

export function ProgressBar({
  chapters = [],
  hoverPreview = false,
  hoverPreviewSrc,
  hoverPreviewCount = 0,
}: ProgressBarProps) {
  const { state, actions } = useVideoPlayerContext();
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState(0);

  // Calculate position from event
  const getPositionFromEvent = useCallback(
    (event: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent): number => {
      const progressBar = progressRef.current;
      if (!progressBar) return 0;

      const rect = progressBar.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, position));
    },
    []
  );

  // Handle click to seek
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = getPositionFromEvent(event);
      const time = position * state.duration;
      actions.seek(time);
    },
    [getPositionFromEvent, state.duration, actions]
  );

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      setIsDragging(true);
      const position = getPositionFromEvent(event);
      const time = position * state.duration;
      actions.seek(time);

      const handleMouseMove = (e: MouseEvent) => {
        const pos = getPositionFromEvent(e);
        const t = pos * state.duration;
        actions.seek(t);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [getPositionFromEvent, state.duration, actions]
  );

  // Handle touch for mobile
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      setIsDragging(true);
      const position = getPositionFromEvent(event);
      const time = position * state.duration;
      actions.seek(time);
    },
    [getPositionFromEvent, state.duration, actions]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging) return;
      const position = getPositionFromEvent(event);
      const time = position * state.duration;
      actions.seek(time);
    },
    [isDragging, getPositionFromEvent, state.duration, actions]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse move for hover preview
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const position = getPositionFromEvent(event);
      setHoverPosition(position);
      setHoverTime(position * state.duration);
    },
    [getPositionFromEvent, state.duration]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  }, [isDragging]);

  // Get current chapter based on currentTime
  // Find the chapter with the latest startTime that is <= currentTime
  const currentChapter = useMemo(() => {
    if (!chapters.length || state.duration === 0) return null;
    
    // Sort chapters by startTime to ensure correct order
    const sortedChapters = [...chapters].sort((a, b) => a.startTime - b.startTime);
    
    // Find the chapter that contains the current time
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];
      
      // Calculate effective endTime: use explicit endTime, or next chapter's startTime, or duration
      const effectiveEndTime = chapter.endTime ?? nextChapter?.startTime ?? state.duration;
      
      if (state.currentTime >= chapter.startTime && state.currentTime < effectiveEndTime) {
        return chapter;
      }
    }
    
    // If currentTime is at or past the last chapter's start, return the last chapter
    const lastChapter = sortedChapters[sortedChapters.length - 1];
    if (state.currentTime >= lastChapter.startTime) {
      return lastChapter;
    }
    
    return null;
  }, [chapters, state.currentTime, state.duration]);

  // Calculate thumbnail position for hover preview
  const thumbnailIndex = useMemo(() => {
    if (!hoverPreviewCount || !hoverPosition) return 0;
    return Math.floor(hoverPosition * hoverPreviewCount);
  }, [hoverPreviewCount, hoverPosition]);

  const thumbnailStyle = useMemo(() => {
    if (!hoverPreviewSrc || !hoverPreviewCount) return {};
    const thumbWidth = 160;
    const thumbHeight = 90;
    return {
      backgroundImage: `url(${hoverPreviewSrc})`,
      backgroundPosition: `-${thumbnailIndex * thumbWidth}px 0`,
      backgroundSize: `${hoverPreviewCount * thumbWidth}px ${thumbHeight}px`,
      width: thumbWidth,
      height: thumbHeight,
    };
  }, [hoverPreviewSrc, hoverPreviewCount, thumbnailIndex]);

  return (
    <div className={styles.container}>
      {/* Chapter info */}
      {currentChapter && (
        <div className={styles.chapterInfo}>
          <span className={styles.chapterTitle}>{currentChapter.title}</span>
          {currentChapter.description && (
            <span className={styles.chapterDescription}>{currentChapter.description}</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        ref={progressRef}
        className={`${styles.progressBar} ${isDragging ? styles.dragging : ''}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={state.duration}
        aria-valuenow={state.currentTime}
        aria-valuetext={formatTime(state.currentTime)}
        tabIndex={0}
      >
        {/* Background track */}
        <div className={styles.track}>
          {/* Buffer indicator */}
          <div
            className={styles.buffer}
            style={{ width: `${state.bufferedPercent}%` }}
          />

          {/* Played indicator */}
          <motion.div
            className={styles.played}
            style={{ width: `${state.playedPercent}%` }}
            layoutId="progress"
          />

          {/* Chapter markers */}
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className={styles.chapterMarker}
              style={{
                left: `${(chapter.startTime / state.duration) * 100}%`,
              }}
              title={chapter.title}
            />
          ))}

          {/* Scrubber handle */}
          <motion.div
            className={styles.handle}
            style={{ left: `${state.playedPercent}%` }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
          />
        </div>

        {/* Hover preview tooltip */}
        {hoverPosition !== null && (
          <div
            className={styles.tooltip}
            style={{ left: `${hoverPosition * 100}%` }}
          >
            {hoverPreview && hoverPreviewSrc && (
              <div className={styles.thumbnailPreview} style={thumbnailStyle} />
            )}
            <span className={styles.tooltipTime}>{formatTime(hoverTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

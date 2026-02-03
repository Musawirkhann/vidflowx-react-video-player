/**
 * useControlsVisibility Hook
 * Manages auto-hide behavior for video player controls
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseControlsVisibilityOptions {
  /** Delay before hiding controls (in ms) */
  hideDelay?: number;
  /** Whether auto-hide is enabled */
  enabled?: boolean;
  /** Whether the video is playing */
  isPlaying?: boolean;
  /** Callback when visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}

export function useControlsVisibility({
  hideDelay = 3000,
  enabled = true,
  isPlaying = false,
  onVisibilityChange,
}: UseControlsVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track latest values for use in timer callback (avoids stale closure)
  const isPlayingRef = useRef(isPlaying);
  const isHoveringRef = useRef(isHovering);
  isPlayingRef.current = isPlaying;
  isHoveringRef.current = isHovering;

  // Clear timeout helper
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Start hide timer
  const startHideTimer = useCallback(() => {
    if (!enabled || hideDelay === 0) return;

    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      // Use refs to get current values, avoiding stale closure
      if (isPlayingRef.current && !isHoveringRef.current) {
        setIsVisible(false);
        onVisibilityChange?.(false);
      }
    }, hideDelay);
  }, [enabled, hideDelay, clearHideTimeout, onVisibilityChange]);

  // Show controls
  const showControls = useCallback(() => {
    setIsVisible(true);
    onVisibilityChange?.(true);
    startHideTimer();
  }, [onVisibilityChange, startHideTimer]);

  // Hide controls
  const hideControls = useCallback(() => {
    if (!enabled) return;
    clearHideTimeout();
    setIsVisible(false);
    onVisibilityChange?.(false);
  }, [enabled, clearHideTimeout, onVisibilityChange]);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    showControls();
  }, [showControls]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    showControls();
    clearHideTimeout();
  }, [showControls, clearHideTimeout]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (isPlaying) {
      startHideTimer();
    }
  }, [isPlaying, startHideTimer]);

  // Handle touch start (for mobile)
  const handleTouchStart = useCallback(() => {
    if (isVisible) {
      hideControls();
    } else {
      showControls();
    }
  }, [isVisible, showControls, hideControls]);

  // Effect to manage timer based on playing state
  useEffect(() => {
    if (isPlaying && !isHovering) {
      startHideTimer();
    } else {
      clearHideTimeout();
      setIsVisible(true);
      onVisibilityChange?.(true);
    }

    return () => {
      clearHideTimeout();
    };
  }, [isPlaying, isHovering, startHideTimer, clearHideTimeout, onVisibilityChange]);

  // Effect to handle focus within container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = () => {
      showControls();
      clearHideTimeout();
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (!container.contains(e.relatedTarget as Node)) {
        if (isPlaying) {
          startHideTimer();
        }
      }
    };

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, [showControls, clearHideTimeout, startHideTimer, isPlaying]);

  return {
    isVisible,
    containerRef,
    showControls,
    hideControls,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
    },
  };
}

export type UseControlsVisibilityReturn = ReturnType<typeof useControlsVisibility>;

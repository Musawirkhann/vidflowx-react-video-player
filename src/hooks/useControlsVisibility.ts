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
  
  // Use refs to track latest values for use in callbacks (avoids stale closures)
  const isPlayingRef = useRef(isPlaying);
  const isHoveringRef = useRef(isHovering);
  const onVisibilityChangeRef = useRef(onVisibilityChange);
  const enabledRef = useRef(enabled);
  const hideDelayRef = useRef(hideDelay);
  
  // Keep refs in sync with props
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);
  
  useEffect(() => {
    onVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);
  
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  useEffect(() => {
    hideDelayRef.current = hideDelay;
  }, [hideDelay]);

  // Clear timeout helper - stable reference
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Start hide timer - stable reference using refs
  const startHideTimer = useCallback(() => {
    if (!enabledRef.current || hideDelayRef.current === 0) return;

    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      // Use refs to get current values, avoiding stale closure
      if (isPlayingRef.current && !isHoveringRef.current) {
        setIsVisible(false);
        onVisibilityChangeRef.current?.(false);
      }
    }, hideDelayRef.current);
  }, [clearHideTimeout]);

  // Show controls - stable reference using refs
  const showControls = useCallback(() => {
    setIsVisible(true);
    onVisibilityChangeRef.current?.(true);
    
    // Only start timer if playing and not hovering
    if (isPlayingRef.current && !isHoveringRef.current) {
      startHideTimer();
    }
  }, [startHideTimer]);

  // Hide controls - stable reference using refs
  const hideControls = useCallback(() => {
    if (!enabledRef.current) return;
    clearHideTimeout();
    setIsVisible(false);
    onVisibilityChangeRef.current?.(false);
  }, [clearHideTimeout]);

  // Handle mouse movement - show controls and restart timer
  const handleMouseMove = useCallback(() => {
    if (!isHoveringRef.current) {
      // Only trigger on actual movement within the container (not while actively hovering controls)
      showControls();
    }
  }, [showControls]);

  // Handle mouse enter - show controls and pause timer
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setIsVisible(true);
    onVisibilityChangeRef.current?.(true);
    clearHideTimeout(); // Stop timer while hovering
  }, [clearHideTimeout]);

  // Handle mouse leave - start timer if playing
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Use ref to get current isPlaying value
    if (isPlayingRef.current) {
      startHideTimer();
    }
  }, [startHideTimer]);

  // Handle touch start (for mobile) - toggle visibility
  const handleTouchStart = useCallback(() => {
    if (isVisible) {
      // Only hide if playing
      if (isPlayingRef.current) {
        hideControls();
      }
    } else {
      showControls();
    }
  }, [isVisible, showControls, hideControls]);

  // Effect to manage timer based on playing state changes
  useEffect(() => {
    if (isPlaying && !isHovering) {
      // Video started playing and not hovering - start hide timer
      startHideTimer();
    } else if (!isPlaying) {
      // Video paused/stopped - show controls and clear timer
      clearHideTimeout();
      setIsVisible(true);
      onVisibilityChangeRef.current?.(true);
    }

    return () => {
      clearHideTimeout();
    };
  }, [isPlaying, isHovering, startHideTimer, clearHideTimeout]);

  // Effect to handle focus within container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = () => {
      setIsVisible(true);
      onVisibilityChangeRef.current?.(true);
      clearHideTimeout();
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (!container.contains(e.relatedTarget as Node)) {
        if (isPlayingRef.current) {
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
  }, [clearHideTimeout, startHideTimer]);

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

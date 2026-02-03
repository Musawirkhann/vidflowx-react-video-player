/**
 * useKeyboardShortcuts Hook
 * Handles keyboard shortcuts for the video player
 */

import { useEffect, useCallback } from 'react';
import type { PlayerActions, KeyboardShortcuts } from '../types';

const DEFAULT_SHORTCUTS: Required<KeyboardShortcuts> = {
  togglePlay: ' ', // Space
  seekForward: 'ArrowRight',
  seekBackward: 'ArrowLeft',
  toggleMute: 'm',
  toggleFullscreen: 'f',
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  toggleCaptions: 'c',
  togglePip: 'p',
  nextTrack: 'n',
  previousTrack: 'b',
};

interface UseKeyboardShortcutsOptions {
  enabled: boolean;
  shortcuts?: KeyboardShortcuts;
  actions: PlayerActions;
  containerRef: React.RefObject<HTMLElement | null>;
  volumeStep?: number;
  seekStep?: number;
  getCurrentVolume: () => number;
}

export function useKeyboardShortcuts({
  enabled,
  shortcuts = {},
  actions,
  containerRef,
  volumeStep = 0.1,
  seekStep = 10,
  getCurrentVolume,
}: UseKeyboardShortcutsOptions) {
  const mergedShortcuts = {
    ...DEFAULT_SHORTCUTS,
    ...shortcuts,
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't handle if focus is on an input element
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if the event is within the player container
      const container = containerRef.current;
      if (!container) return;

      // Allow shortcuts when focus is on the container or its children
      if (!container.contains(target) && target !== container) {
        return;
      }

      const key = event.key;

      // Toggle play/pause
      if (key === mergedShortcuts.togglePlay) {
        event.preventDefault();
        actions.togglePlay();
        return;
      }

      // Seek forward
      if (key === mergedShortcuts.seekForward) {
        event.preventDefault();
        actions.seekForward(seekStep);
        return;
      }

      // Seek backward
      if (key === mergedShortcuts.seekBackward) {
        event.preventDefault();
        actions.seekBackward(seekStep);
        return;
      }

      // Toggle mute
      if (key.toLowerCase() === mergedShortcuts.toggleMute.toLowerCase()) {
        event.preventDefault();
        actions.toggleMute();
        return;
      }

      // Toggle fullscreen
      if (key.toLowerCase() === mergedShortcuts.toggleFullscreen.toLowerCase()) {
        event.preventDefault();
        actions.toggleFullscreen();
        return;
      }

      // Volume up
      if (key === mergedShortcuts.volumeUp) {
        event.preventDefault();
        const currentVolume = getCurrentVolume();
        actions.setVolume(Math.min(1, currentVolume + volumeStep));
        return;
      }

      // Volume down
      if (key === mergedShortcuts.volumeDown) {
        event.preventDefault();
        const currentVolume = getCurrentVolume();
        actions.setVolume(Math.max(0, currentVolume - volumeStep));
        return;
      }

      // Toggle captions
      if (key.toLowerCase() === mergedShortcuts.toggleCaptions.toLowerCase()) {
        event.preventDefault();
        // Toggle between -1 (off) and 0 (first track)
        // This is a simplified implementation; actual implementation would
        // need to track current caption state
        return;
      }

      // Toggle PiP
      if (key.toLowerCase() === mergedShortcuts.togglePip.toLowerCase()) {
        event.preventDefault();
        actions.togglePip();
        return;
      }

      // Next track
      if (key.toLowerCase() === mergedShortcuts.nextTrack.toLowerCase()) {
        event.preventDefault();
        actions.nextTrack();
        return;
      }

      // Previous track
      if (key.toLowerCase() === mergedShortcuts.previousTrack.toLowerCase()) {
        event.preventDefault();
        actions.previousTrack();
        return;
      }

      // Number keys for seeking to percentage
      if (key >= '0' && key <= '9') {
        event.preventDefault();
        // Seek to percentage (0 = 0%, 5 = 50%, etc.)
        // This requires duration which should be passed in
        return;
      }
    },
    [
      enabled,
      actions,
      containerRef,
      mergedShortcuts,
      seekStep,
      volumeStep,
      getCurrentVolume,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

export function getShortcutLabel(key: string): string {
  const labels: Record<string, string> = {
    ' ': 'Space',
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
  };

  return labels[key] || key.toUpperCase();
}

/**
 * useVideoState Hook
 * Manages the internal state of the video player
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type {
  PlayerState,
  PlaybackState,
  VideoSource,
} from '../types';
import { parseSource } from '../utils/sourceDetector';
import { getPlayedPercent, getBufferedPercent } from '../utils/formatTime';

export interface UseVideoStateOptions {
  initialVolume?: number;
  initialMuted?: boolean;
  initialPlaybackRate?: number;
}

const initialState: PlayerState = {
  playbackState: 'idle',
  isPlaying: false,
  isPaused: true,
  isBuffering: false,
  isEnded: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  buffered: null,
  bufferedPercent: 0,
  playedPercent: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  isPip: false,
  activeCaptionIndex: -1,
  source: null,
  sourceType: null,
  error: null,
  controlsVisible: true,
  quality: null,
  availableQualities: [],
};

export function useVideoState(options: UseVideoStateOptions = {}) {
  const {
    initialVolume = 1,
    initialMuted = false,
    initialPlaybackRate = 1,
  } = options;

  const [state, setState] = useState<PlayerState>({
    ...initialState,
    volume: initialVolume,
    isMuted: initialMuted,
    playbackRate: initialPlaybackRate,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Update a single state property
  const updateState = useCallback(<K extends keyof PlayerState>(
    key: K,
    value: PlayerState[K]
  ) => {
    setState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // Update multiple state properties at once
  const updateStateMultiple = useCallback((updates: Partial<PlayerState>) => {
    setState((prev) => {
      const newState = { ...prev };
      let hasChanges = false;

      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const k = key as keyof PlayerState;
          if (prev[k] !== updates[k]) {
            (newState as Record<keyof PlayerState, unknown>)[k] = updates[k];
            hasChanges = true;
          }
        }
      }

      return hasChanges ? newState : prev;
    });
  }, []);

  // Set playback state with derived flags
  const setPlaybackState = useCallback((playbackState: PlaybackState) => {
    setState((prev) => ({
      ...prev,
      playbackState,
      isPlaying: playbackState === 'playing',
      isPaused: playbackState === 'paused' || playbackState === 'idle',
      isBuffering: playbackState === 'buffering',
      isEnded: playbackState === 'ended',
      isLoading: playbackState === 'loading',
    }));
  }, []);

  // Set source with type detection
  const setSource = useCallback((source: VideoSource | null) => {
    if (!source) {
      updateStateMultiple({
        source: null,
        sourceType: null,
        playbackState: 'idle',
        isPlaying: false,
        isPaused: true,
        currentTime: 0,
        duration: 0,
        error: null,
      });
      return;
    }

    const parsed = parseSource(source);
    
    updateStateMultiple({
      source,
      sourceType: parsed.type,
      // Start in idle state - loading indicator will show only during buffering
      playbackState: 'idle',
      isLoading: false,
      isPlaying: false,
      isPaused: true,
      error: null,
    });
  }, [updateStateMultiple]);

  // Set time with percentage calculation
  const setCurrentTime = useCallback((currentTime: number) => {
    const duration = stateRef.current.duration;
    const playedPercent = getPlayedPercent(currentTime, duration);
    updateStateMultiple({ currentTime, playedPercent });
  }, [updateStateMultiple]);

  // Set duration
  const setDuration = useCallback((duration: number) => {
    const currentTime = stateRef.current.currentTime;
    const playedPercent = getPlayedPercent(currentTime, duration);
    updateStateMultiple({ duration, playedPercent });
  }, [updateStateMultiple]);

  // Set buffered with percentage calculation
  const setBuffered = useCallback((buffered: TimeRanges | null) => {
    const duration = stateRef.current.duration;
    const bufferedPercent = getBufferedPercent(buffered, duration);
    updateStateMultiple({ buffered, bufferedPercent });
  }, [updateStateMultiple]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    updateState('volume', clampedVolume);
  }, [updateState]);

  // Set muted
  const setMuted = useCallback((isMuted: boolean) => {
    updateState('isMuted', isMuted);
  }, [updateState]);

  // Set playback rate
  const setPlaybackRate = useCallback((playbackRate: number) => {
    updateState('playbackRate', playbackRate);
  }, [updateState]);

  // Set fullscreen
  const setFullscreen = useCallback((isFullscreen: boolean) => {
    updateState('isFullscreen', isFullscreen);
  }, [updateState]);

  // Set PiP
  const setPip = useCallback((isPip: boolean) => {
    updateState('isPip', isPip);
  }, [updateState]);

  // Set active caption
  const setActiveCaption = useCallback((activeCaptionIndex: number) => {
    updateState('activeCaptionIndex', activeCaptionIndex);
  }, [updateState]);

  // Set error
  const setError = useCallback((error: Error | null) => {
    if (error) {
      updateStateMultiple({
        error,
        playbackState: 'error',
        isPlaying: false,
        isPaused: true,
        isLoading: false,
      });
    } else {
      updateState('error', null);
    }
  }, [updateState, updateStateMultiple]);

  // Set controls visibility
  const setControlsVisible = useCallback((controlsVisible: boolean) => {
    updateState('controlsVisible', controlsVisible);
  }, [updateState]);

  // Set quality
  const setQuality = useCallback((quality: string | null) => {
    updateState('quality', quality);
  }, [updateState]);

  // Set available qualities
  const setAvailableQualities = useCallback((qualities: string[]) => {
    updateState('availableQualities', qualities);
  }, [updateState]);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      ...initialState,
      volume: stateRef.current.volume,
      isMuted: stateRef.current.isMuted,
      playbackRate: stateRef.current.playbackRate,
    });
  }, []);

  // Get current state snapshot
  const getState = useCallback(() => stateRef.current, []);

  // Memoize the return object to maintain stable reference
  return useMemo(() => ({
    state,
    getState,
    updateState,
    updateStateMultiple,
    setPlaybackState,
    setSource,
    setCurrentTime,
    setDuration,
    setBuffered,
    setVolume,
    setMuted,
    setPlaybackRate,
    setFullscreen,
    setPip,
    setActiveCaption,
    setError,
    setControlsVisible,
    setQuality,
    setAvailableQualities,
    resetState,
  }), [
    state,
    getState,
    updateState,
    updateStateMultiple,
    setPlaybackState,
    setSource,
    setCurrentTime,
    setDuration,
    setBuffered,
    setVolume,
    setMuted,
    setPlaybackRate,
    setFullscreen,
    setPip,
    setActiveCaption,
    setError,
    setControlsVisible,
    setQuality,
    setAvailableQualities,
    resetState,
  ]);
}

export type UseVideoStateReturn = ReturnType<typeof useVideoState>;

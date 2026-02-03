/**
 * useVideoActions Hook
 * Provides actions to control the video player
 */

import { useCallback, useRef } from 'react';
import type { PlayerActions, VideoSource, PlaylistConfig } from '../types';
import type { UseVideoStateReturn } from './useVideoState';
import { clamp, isBrowser } from '../utils';

interface UseVideoActionsOptions {
  stateManager: UseVideoStateReturn;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  seekStep?: number;
  playlist?: PlaylistConfig;
  onSourceChange?: (source: VideoSource) => void;
}

export function useVideoActions({
  stateManager,
  videoRef,
  containerRef,
  seekStep = 10,
  playlist,
  onSourceChange,
}: UseVideoActionsOptions): PlayerActions {
  const currentPlaylistIndex = useRef(playlist?.startIndex ?? 0);

  // Play
  const play = useCallback(async (): Promise<void> => {
    const video = videoRef.current;
    if (!video) {
      console.warn('VidFlowX: Video element not found');
      return;
    }

    try {
      await video.play();
      // State will be updated by the native 'play' event handler
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('VidFlowX: Play failed', error);
        stateManager.setError(error as Error);
      }
    }
  }, [stateManager, videoRef]);

  // Pause
  const pause = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    stateManager.setPlaybackState('paused');
  }, [stateManager, videoRef]);

  // Toggle play/pause
  const togglePlay = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause, videoRef]);

  // Stop
  const stop = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    stateManager.setCurrentTime(0);
    stateManager.setPlaybackState('idle');
  }, [stateManager, videoRef]);

  // Seek to specific time
  const seek = useCallback((time: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || 0;
    const clampedTime = clamp(time, 0, duration);
    video.currentTime = clampedTime;
    stateManager.setCurrentTime(clampedTime);
  }, [stateManager, videoRef]);

  // Seek forward
  const seekForward = useCallback((seconds?: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const step = seconds ?? seekStep;
    seek(video.currentTime + step);
  }, [seek, seekStep, videoRef]);

  // Seek backward
  const seekBackward = useCallback((seconds?: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const step = seconds ?? seekStep;
    seek(video.currentTime - step);
  }, [seek, seekStep, videoRef]);

  // Set volume
  const setVolume = useCallback((volume: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const clampedVolume = clamp(volume, 0, 1);
    video.volume = clampedVolume;
    stateManager.setVolume(clampedVolume);

    if (clampedVolume > 0 && video.muted) {
      video.muted = false;
      stateManager.setMuted(false);
    }
  }, [stateManager, videoRef]);

  // Mute
  const mute = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    stateManager.setMuted(true);
  }, [stateManager, videoRef]);

  // Unmute
  const unmute = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    stateManager.setMuted(false);
  }, [stateManager, videoRef]);

  // Toggle mute
  const toggleMute = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      unmute();
    } else {
      mute();
    }
  }, [mute, unmute, videoRef]);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const clampedRate = clamp(rate, 0.25, 4);
    video.playbackRate = clampedRate;
    stateManager.setPlaybackRate(clampedRate);
  }, [stateManager, videoRef]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (!isBrowser()) return;

    const container = containerRef.current;
    if (!container) return;

    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (container as HTMLDivElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      } else if ((container as HTMLDivElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
        await (container as HTMLDivElement & { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
      } else if ((container as HTMLDivElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
        await (container as HTMLDivElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
      }
      stateManager.setFullscreen(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, [containerRef, stateManager]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (!isBrowser()) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ((document as Document & { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
        await (document as Document & { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
      } else if ((document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
        await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
      stateManager.setFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, [stateManager]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async (): Promise<void> => {
    const isFullscreen = stateManager.getState().isFullscreen;
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen, stateManager]);

  // Enter PiP
  const enterPip = useCallback(async (): Promise<void> => {
    if (!isBrowser()) return;

    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        stateManager.setPip(true);
      }
    } catch (error) {
      console.error('Failed to enter PiP:', error);
    }
  }, [stateManager, videoRef]);

  // Exit PiP
  const exitPip = useCallback(async (): Promise<void> => {
    if (!isBrowser()) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        stateManager.setPip(false);
      }
    } catch (error) {
      console.error('Failed to exit PiP:', error);
    }
  }, [stateManager]);

  // Toggle PiP
  const togglePip = useCallback(async (): Promise<void> => {
    const isPip = stateManager.getState().isPip;
    if (isPip) {
      await exitPip();
    } else {
      await enterPip();
    }
  }, [enterPip, exitPip, stateManager]);

  // Set active caption
  const setActiveCaption = useCallback((index: number): void => {
    const video = videoRef.current;
    if (!video) return;

    // Disable all tracks first
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === index ? 'showing' : 'hidden';
    }

    stateManager.setActiveCaption(index);
  }, [stateManager, videoRef]);

  // Set source
  const setSource = useCallback((source: VideoSource): void => {
    stateManager.setSource(source);
    onSourceChange?.(source);
  }, [stateManager, onSourceChange]);

  // Set quality
  const setQuality = useCallback((quality: string): void => {
    stateManager.setQuality(quality);
    // Actual quality switching is handled by HLS.js/dash.js in adapters
  }, [stateManager]);

  // Next track in playlist
  const nextTrack = useCallback((): void => {
    if (!playlist?.items.length) return;

    const nextIndex = currentPlaylistIndex.current + 1;
    if (nextIndex < playlist.items.length) {
      currentPlaylistIndex.current = nextIndex;
      setSource(playlist.items[nextIndex].src);
    } else if (playlist.loop) {
      currentPlaylistIndex.current = 0;
      setSource(playlist.items[0].src);
    }
  }, [playlist, setSource]);

  // Previous track in playlist
  const previousTrack = useCallback((): void => {
    if (!playlist?.items.length) return;

    const prevIndex = currentPlaylistIndex.current - 1;
    if (prevIndex >= 0) {
      currentPlaylistIndex.current = prevIndex;
      setSource(playlist.items[prevIndex].src);
    } else if (playlist.loop) {
      const lastIndex = playlist.items.length - 1;
      currentPlaylistIndex.current = lastIndex;
      setSource(playlist.items[lastIndex].src);
    }
  }, [playlist, setSource]);

  // Skip to specific track
  const skipToTrack = useCallback((index: number): void => {
    if (!playlist?.items.length) return;

    if (index >= 0 && index < playlist.items.length) {
      currentPlaylistIndex.current = index;
      setSource(playlist.items[index].src);
    }
  }, [playlist, setSource]);

  return {
    play,
    pause,
    togglePlay,
    stop,
    seek,
    seekForward,
    seekBackward,
    setVolume,
    mute,
    unmute,
    toggleMute,
    setPlaybackRate,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    enterPip,
    exitPip,
    togglePip,
    setActiveCaption,
    setSource,
    setQuality,
    nextTrack,
    previousTrack,
    skipToTrack,
  };
}

export type UseVideoActionsReturn = ReturnType<typeof useVideoActions>;

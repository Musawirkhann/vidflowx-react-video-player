/**
 * useVideoPlayer Hook
 * Main hook for external consumers to control the video player
 */

import { useRef, useCallback, useEffect } from 'react';
import type {
  PlayerState,
  PlayerActions,
  VideoPlayerRef,
  UseVideoPlayerReturn,
} from '../types';

/**
 * Hook to control a VidFlowX video player instance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, actions, ref } = useVideoPlayer();
 * 
 *   return (
 *     <div>
 *       <VideoPlayer ref={ref} src="video.mp4" />
 *       <p>Current time: {state.currentTime}</p>
 *       <button onClick={actions.togglePlay}>
 *         {state.isPlaying ? 'Pause' : 'Play'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideoPlayer(): UseVideoPlayerReturn {
  const ref = useRef<VideoPlayerRef>(null);
  const stateRef = useRef<PlayerState | null>(null);

  // Get current state from the player ref
  const getStateFromRef = useCallback((): PlayerState => {
    if (ref.current) {
      return ref.current.getState();
    }
    
    // Return a default state if ref is not available
    return {
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
  }, []);

  // Create proxy actions that delegate to the ref
  const actions: PlayerActions = {
    play: async () => {
      if (ref.current) await ref.current.play();
    },
    pause: () => {
      if (ref.current) ref.current.pause();
    },
    togglePlay: () => {
      if (ref.current) ref.current.togglePlay();
    },
    stop: () => {
      if (ref.current) ref.current.stop();
    },
    seek: (time: number) => {
      if (ref.current) ref.current.seek(time);
    },
    seekForward: (seconds?: number) => {
      if (ref.current) ref.current.seekForward(seconds);
    },
    seekBackward: (seconds?: number) => {
      if (ref.current) ref.current.seekBackward(seconds);
    },
    setVolume: (volume: number) => {
      if (ref.current) ref.current.setVolume(volume);
    },
    mute: () => {
      if (ref.current) ref.current.mute();
    },
    unmute: () => {
      if (ref.current) ref.current.unmute();
    },
    toggleMute: () => {
      if (ref.current) ref.current.toggleMute();
    },
    setPlaybackRate: (rate: number) => {
      if (ref.current) ref.current.setPlaybackRate(rate);
    },
    enterFullscreen: async () => {
      if (ref.current) await ref.current.enterFullscreen();
    },
    exitFullscreen: async () => {
      if (ref.current) await ref.current.exitFullscreen();
    },
    toggleFullscreen: async () => {
      if (ref.current) await ref.current.toggleFullscreen();
    },
    enterPip: async () => {
      if (ref.current) await ref.current.enterPip();
    },
    exitPip: async () => {
      if (ref.current) await ref.current.exitPip();
    },
    togglePip: async () => {
      if (ref.current) await ref.current.togglePip();
    },
    setActiveCaption: (index: number) => {
      if (ref.current) ref.current.setActiveCaption(index);
    },
    setSource: (source) => {
      if (ref.current) ref.current.setSource(source);
    },
    setQuality: (quality: string) => {
      if (ref.current) ref.current.setQuality(quality);
    },
    nextTrack: () => {
      if (ref.current) ref.current.nextTrack();
    },
    previousTrack: () => {
      if (ref.current) ref.current.previousTrack();
    },
    skipToTrack: (index: number) => {
      if (ref.current) ref.current.skipToTrack(index);
    },
  };

  // Initialize state ref
  useEffect(() => {
    stateRef.current = getStateFromRef();
  }, [getStateFromRef]);

  return {
    state: getStateFromRef(),
    actions,
    ref,
  };
}

export default useVideoPlayer;

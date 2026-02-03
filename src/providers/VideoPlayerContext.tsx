/**
 * VideoPlayerContext
 * Provides video player state and actions to child components
 */

import React, { createContext, useContext } from 'react';
import type {
  PlayerState,
  PlayerActions,
  VideoPlayerProps,
  VideoPlayerContextValue,
} from '../types';

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

interface VideoPlayerProviderProps {
  children: React.ReactNode;
  state: PlayerState;
  actions: PlayerActions;
  props: VideoPlayerProps;
}

export function VideoPlayerProvider({
  children,
  state,
  actions,
  props,
}: VideoPlayerProviderProps) {
  // Pass the value directly - React will handle updates when state changes
  const value: VideoPlayerContextValue = { state, actions, props };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

/**
 * Hook to access the video player context
 * Must be used within a VideoPlayer component
 */
export function useVideoPlayerContext(): VideoPlayerContextValue {
  const context = useContext(VideoPlayerContext);
  
  if (!context) {
    throw new Error(
      'useVideoPlayerContext must be used within a VideoPlayer component'
    );
  }
  
  return context;
}

/**
 * Hook to access only the player state
 */
export function usePlayerState(): PlayerState {
  const { state } = useVideoPlayerContext();
  return state;
}

/**
 * Hook to access only the player actions
 */
export function usePlayerActions(): PlayerActions {
  const { actions } = useVideoPlayerContext();
  return actions;
}

/**
 * Hook to access the player props
 */
export function usePlayerProps(): VideoPlayerProps {
  const { props } = useVideoPlayerContext();
  return props;
}

export { VideoPlayerContext };

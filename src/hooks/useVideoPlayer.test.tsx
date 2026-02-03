import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVideoPlayer } from './useVideoPlayer';

describe('useVideoPlayer', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useVideoPlayer());

    expect(result.current.state).toBeDefined();
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.isPaused).toBe(true);
    expect(result.current.state.currentTime).toBe(0);
    expect(result.current.state.duration).toBe(0);
    expect(result.current.state.volume).toBe(1);
    expect(result.current.state.isMuted).toBe(false);
  });

  it('should return actions', () => {
    const { result } = renderHook(() => useVideoPlayer());

    expect(result.current.actions).toBeDefined();
    expect(typeof result.current.actions.play).toBe('function');
    expect(typeof result.current.actions.pause).toBe('function');
    expect(typeof result.current.actions.togglePlay).toBe('function');
    expect(typeof result.current.actions.seek).toBe('function');
    expect(typeof result.current.actions.setVolume).toBe('function');
    expect(typeof result.current.actions.toggleMute).toBe('function');
    expect(typeof result.current.actions.toggleFullscreen).toBe('function');
  });

  it('should return ref', () => {
    const { result } = renderHook(() => useVideoPlayer());

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });
});

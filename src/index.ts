/**
 * VidFlowX - A fully customizable React video player
 * 
 * @packageDocumentation
 */

// Main component
export { VideoPlayer } from './components/VideoPlayer';
export { default } from './components/VideoPlayer';

// Sub-components for custom composition
export { NativeVideo } from './components/NativeVideo';
export { EmbeddedVideo } from './components/EmbeddedVideo';
export { Controls } from './components/Controls';
export { ProgressBar } from './components/ProgressBar';
export { VolumeControl } from './components/VolumeControl';
export { LoadingIndicator } from './components/LoadingIndicator';
export { ErrorDisplay } from './components/ErrorDisplay';

// Hooks
export { useVideoPlayer } from './hooks/useVideoPlayer';
export { useVideoState } from './hooks/useVideoState';
export { useVideoActions } from './hooks/useVideoActions';
export { useKeyboardShortcuts, getShortcutLabel } from './hooks/useKeyboardShortcuts';
export { useControlsVisibility } from './hooks/useControlsVisibility';

// Context and providers
export {
  VideoPlayerProvider,
  useVideoPlayerContext,
  usePlayerState,
  usePlayerActions,
  usePlayerProps,
} from './providers/VideoPlayerContext';

// Utilities
export {
  formatTime,
  formatTimeVerbose,
  parseTime,
  getPlayedPercent,
  getBufferedPercent,
} from './utils/formatTime';

export {
  detectSourceType,
  parseSource,
  isNativeSource,
  isEmbeddedSource,
  extractYouTubeId,
  extractVimeoId,
  extractDailymotionId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
  getDailymotionEmbedUrl,
} from './utils/sourceDetector';

export {
  clamp,
  isBrowser,
  isSSR,
  isFullscreenSupported,
  isPipSupported,
  isHlsNativelySupported,
  generateId,
  debounce,
  throttle,
  parseAspectRatio,
  getCSSVariable,
  setCSSVariable,
  mergeRefs,
} from './utils';

// Types
export type {
  // Source types
  VideoSourceType,
  VideoSourceObject,
  VideoSource,
  
  // Caption/Subtitle types
  CaptionTrack,
  
  // Chapter/Hotspot types
  Chapter,
  
  // Playlist types
  PlaylistItem,
  PlaylistConfig,
  
  // Control configuration
  ControlsConfig,
  
  // Keyboard shortcuts
  KeyboardShortcuts,
  
  // Theme types
  ThemeMode,
  ThemeColors,
  ThemeConfig,
  
  // Analytics event types
  AnalyticsEventData,
  SeekEventData,
  BufferEventData,
  ErrorEventData,
  
  // Player state
  PlaybackState,
  PlayerState,
  PlayerActions,
  
  // Ref type
  VideoPlayerRef,
  
  // Mini player
  MiniPlayerConfig,
  
  // Plugin system
  PluginContext,
  Plugin,
  
  // Component overrides
  ControlComponentProps,
  ComponentOverrides,
  
  // Main props
  VideoPlayerProps,
  
  // Context
  VideoPlayerContextValue,
  
  // Hook return types
  UseVideoPlayerReturn,
} from './types';

// Import styles (side effect)
import './components/VideoPlayer/VideoPlayer.module.css';

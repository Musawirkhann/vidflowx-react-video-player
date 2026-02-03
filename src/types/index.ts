/**
 * VidFlowX - Type Definitions
 * Comprehensive types for the video player component
 */

// ============================================================================
// Source Types
// ============================================================================

export type VideoSourceType =
  | 'file'
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'facebook'
  | 'tiktok'
  | 'hls'
  | 'dash';

export interface VideoSourceObject {
  type: VideoSourceType;
  url: string;
}

export type VideoSource = string | VideoSourceObject;

// ============================================================================
// Caption/Subtitle Types
// ============================================================================

export interface CaptionTrack {
  /** URL to the .vtt subtitle file */
  src: string;
  /** Language code (e.g., 'en', 'es', 'fr') */
  lang: string;
  /** Human-readable label (e.g., 'English', 'Spanish') */
  label?: string;
  /** Whether this track is the default */
  default?: boolean;
}

// ============================================================================
// Chapter/Hotspot Types
// ============================================================================

export interface Chapter {
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds (optional) */
  endTime?: number;
  /** Chapter title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional thumbnail URL for the chapter */
  thumbnail?: string;
}

// ============================================================================
// Playlist Types
// ============================================================================

export interface PlaylistItem {
  /** Unique identifier for the playlist item */
  id: string;
  /** Video source */
  src: VideoSource;
  /** Video title */
  title?: string;
  /** Poster image URL */
  poster?: string;
  /** Duration in seconds (optional, will be detected) */
  duration?: number;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

export interface PlaylistConfig {
  /** List of videos in the playlist */
  items: PlaylistItem[];
  /** Index of the initial video to play */
  startIndex?: number;
  /** Whether to automatically play the next video */
  autoPlayNext?: boolean;
  /** Whether to loop the playlist */
  loop?: boolean;
}

// ============================================================================
// Control Configuration Types
// ============================================================================

export interface ControlsConfig {
  /** Show/hide the custom UI controls */
  customUI?: boolean;
  /** Show/hide play button */
  play?: boolean;
  /** Show/hide progress bar */
  progress?: boolean;
  /** Show/hide current time display */
  currentTime?: boolean;
  /** Show/hide duration display */
  duration?: boolean;
  /** Show/hide volume control */
  volume?: boolean;
  /** Show/hide mute button */
  mute?: boolean;
  /** Show/hide playback speed control */
  playbackSpeed?: boolean;
  /** Show/hide fullscreen button */
  fullscreen?: boolean;
  /** Show/hide picture-in-picture button */
  pip?: boolean;
  /** Show/hide captions button */
  captions?: boolean;
  /** Show/hide settings button */
  settings?: boolean;
  /** Show/hide chapters */
  chapters?: boolean;
}

// ============================================================================
// Keyboard Shortcut Types
// ============================================================================

export interface KeyboardShortcuts {
  /** Toggle play/pause (default: Space) */
  togglePlay?: string;
  /** Seek forward (default: ArrowRight) */
  seekForward?: string;
  /** Seek backward (default: ArrowLeft) */
  seekBackward?: string;
  /** Toggle mute (default: m) */
  toggleMute?: string;
  /** Toggle fullscreen (default: f) */
  toggleFullscreen?: string;
  /** Increase volume (default: ArrowUp) */
  volumeUp?: string;
  /** Decrease volume (default: ArrowDown) */
  volumeDown?: string;
  /** Toggle captions (default: c) */
  toggleCaptions?: string;
  /** Toggle picture-in-picture (default: p) */
  togglePip?: string;
  /** Skip to next in playlist (default: n) */
  nextTrack?: string;
  /** Skip to previous in playlist (default: b) */
  previousTrack?: string;
}

// ============================================================================
// Theme Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  /** Primary accent color */
  primary?: string;
  /** Secondary color */
  secondary?: string;
  /** Background color for controls */
  controlsBackground?: string;
  /** Text color */
  text?: string;
  /** Text color on primary background */
  textOnPrimary?: string;
  /** Progress bar background */
  progressBackground?: string;
  /** Progress bar filled color */
  progressFilled?: string;
  /** Buffer indicator color */
  progressBuffer?: string;
  /** Tooltip background */
  tooltipBackground?: string;
  /** Tooltip text color */
  tooltipText?: string;
}

export interface ThemeConfig {
  /** Theme mode */
  mode?: ThemeMode;
  /** Custom colors */
  colors?: ThemeColors;
  /** Border radius for controls (in px) */
  borderRadius?: number;
  /** Control bar height (in px) */
  controlBarHeight?: number;
  /** Icon size (in px) */
  iconSize?: number;
  /** Font family */
  fontFamily?: string;
}

// ============================================================================
// Analytics Event Types
// ============================================================================

export interface AnalyticsEventData {
  /** Current playback time */
  currentTime: number;
  /** Total duration */
  duration: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether the video is muted */
  muted: boolean;
  /** Current playback rate */
  playbackRate: number;
  /** Video source */
  source: VideoSource;
  /** Whether the video is fullscreen */
  isFullscreen: boolean;
  /** Quality label if available */
  quality?: string;
  /** Additional custom data */
  [key: string]: unknown;
}

export interface SeekEventData extends AnalyticsEventData {
  /** Time seeked from */
  fromTime: number;
  /** Time seeked to */
  toTime: number;
}

export interface BufferEventData extends AnalyticsEventData {
  /** Buffered time ranges */
  buffered: TimeRanges | null;
  /** Current buffered percentage */
  bufferedPercent: number;
}

export interface ErrorEventData {
  /** Error object */
  error: Error;
  /** Error code if available */
  code?: number;
  /** Video source that errored */
  source: VideoSource;
}

// ============================================================================
// Player State Types
// ============================================================================

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

export interface PlayerState {
  /** Current playback state */
  playbackState: PlaybackState;
  /** Whether the video is currently playing */
  isPlaying: boolean;
  /** Whether the video is paused */
  isPaused: boolean;
  /** Whether the video is buffering */
  isBuffering: boolean;
  /** Whether the video has ended */
  isEnded: boolean;
  /** Whether the video is loading */
  isLoading: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Buffered time ranges */
  buffered: TimeRanges | null;
  /** Buffered percentage (0-100) */
  bufferedPercent: number;
  /** Played percentage (0-100) */
  playedPercent: number;
  /** Current volume (0-1) */
  volume: number;
  /** Whether the video is muted */
  isMuted: boolean;
  /** Current playback rate */
  playbackRate: number;
  /** Whether the video is in fullscreen mode */
  isFullscreen: boolean;
  /** Whether the video is in picture-in-picture mode */
  isPip: boolean;
  /** Current active caption track index (-1 for none) */
  activeCaptionIndex: number;
  /** Current video source */
  source: VideoSource | null;
  /** Detected source type */
  sourceType: VideoSourceType | null;
  /** Any error that occurred */
  error: Error | null;
  /** Whether controls are currently visible */
  controlsVisible: boolean;
  /** Current quality (for adaptive streaming) */
  quality: string | null;
  /** Available qualities */
  availableQualities: string[];
}

// ============================================================================
// Player Actions Types
// ============================================================================

export interface PlayerActions {
  /** Start playback */
  play: () => Promise<void>;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Stop playback and reset to beginning */
  stop: () => void;
  /** Seek to a specific time in seconds */
  seek: (time: number) => void;
  /** Seek forward by specified seconds */
  seekForward: (seconds?: number) => void;
  /** Seek backward by specified seconds */
  seekBackward: (seconds?: number) => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Mute the video */
  mute: () => void;
  /** Unmute the video */
  unmute: () => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Set playback rate */
  setPlaybackRate: (rate: number) => void;
  /** Enter fullscreen mode */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen mode */
  exitFullscreen: () => Promise<void>;
  /** Toggle fullscreen mode */
  toggleFullscreen: () => Promise<void>;
  /** Enter picture-in-picture mode */
  enterPip: () => Promise<void>;
  /** Exit picture-in-picture mode */
  exitPip: () => Promise<void>;
  /** Toggle picture-in-picture mode */
  togglePip: () => Promise<void>;
  /** Set the active caption track by index (-1 to disable) */
  setActiveCaption: (index: number) => void;
  /** Set the video source */
  setSource: (source: VideoSource) => void;
  /** Set quality level */
  setQuality: (quality: string) => void;
  /** Skip to next video in playlist */
  nextTrack: () => void;
  /** Skip to previous video in playlist */
  previousTrack: () => void;
  /** Skip to a specific index in the playlist */
  skipToTrack: (index: number) => void;
}

// ============================================================================
// Ref Types
// ============================================================================

export interface VideoPlayerRef extends PlayerActions {
  /** Get the current player state */
  getState: () => PlayerState;
  /** Get the underlying video element */
  getVideoElement: () => HTMLVideoElement | null;
  /** Get the container element */
  getContainerElement: () => HTMLDivElement | null;
}

// ============================================================================
// Mini Player Types
// ============================================================================

export interface MiniPlayerConfig {
  /** Enable mini player mode */
  enabled?: boolean;
  /** Width of the mini player (default: 320) */
  width?: number;
  /** Height of the mini player (default: 180) */
  height?: number;
  /** Initial position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Whether the mini player is draggable */
  draggable?: boolean;
  /** Offset from the edge (in px) */
  offset?: { x: number; y: number };
  /** Z-index for the mini player */
  zIndex?: number;
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface PluginContext {
  /** Current player state */
  state: PlayerState;
  /** Player actions */
  actions: PlayerActions;
  /** Video element ref */
  videoElement: HTMLVideoElement | null;
  /** Container element ref */
  containerElement: HTMLDivElement | null;
}

export interface Plugin {
  /** Unique plugin name */
  name: string;
  /** Plugin version */
  version?: string;
  /** Called when plugin is initialized */
  onInit?: (context: PluginContext) => void;
  /** Called when plugin is destroyed */
  onDestroy?: (context: PluginContext) => void;
  /** Called on each state change */
  onStateChange?: (context: PluginContext, prevState: PlayerState) => void;
  /** Called before play */
  onBeforePlay?: (context: PluginContext) => boolean | void;
  /** Called after play */
  onPlay?: (context: PluginContext) => void;
  /** Called before pause */
  onBeforePause?: (context: PluginContext) => boolean | void;
  /** Called after pause */
  onPause?: (context: PluginContext) => void;
  /** Called on seek */
  onSeek?: (context: PluginContext, from: number, to: number) => void;
  /** Called on ended */
  onEnded?: (context: PluginContext) => void;
  /** Called on error */
  onError?: (context: PluginContext, error: Error) => void;
  /** Called on time update */
  onTimeUpdate?: (context: PluginContext) => void;
  /** Custom render function for UI overlay */
  render?: (context: PluginContext) => React.ReactNode;
}

// ============================================================================
// Component Override Types
// ============================================================================

export interface ControlComponentProps {
  state: PlayerState;
  actions: PlayerActions;
}

export interface ComponentOverrides {
  /** Custom play button component */
  PlayButton?: React.ComponentType<ControlComponentProps>;
  /** Custom pause button component */
  PauseButton?: React.ComponentType<ControlComponentProps>;
  /** Custom volume control component */
  VolumeControl?: React.ComponentType<ControlComponentProps>;
  /** Custom progress bar component */
  ProgressBar?: React.ComponentType<ControlComponentProps>;
  /** Custom time display component */
  TimeDisplay?: React.ComponentType<ControlComponentProps>;
  /** Custom fullscreen button component */
  FullscreenButton?: React.ComponentType<ControlComponentProps>;
  /** Custom PiP button component */
  PipButton?: React.ComponentType<ControlComponentProps>;
  /** Custom playback speed control component */
  PlaybackSpeedControl?: React.ComponentType<ControlComponentProps>;
  /** Custom captions button component */
  CaptionsButton?: React.ComponentType<ControlComponentProps>;
  /** Custom settings menu component */
  SettingsMenu?: React.ComponentType<ControlComponentProps>;
  /** Custom loading indicator component */
  LoadingIndicator?: React.ComponentType<ControlComponentProps>;
  /** Custom error display component */
  ErrorDisplay?: React.ComponentType<ControlComponentProps & { error: Error }>;
  /** Custom big play button (center overlay) */
  BigPlayButton?: React.ComponentType<ControlComponentProps>;
  /** Custom control bar container */
  ControlBar?: React.ComponentType<ControlComponentProps & { children: React.ReactNode }>;
}

// ============================================================================
// Main Props Types
// ============================================================================

export interface VideoPlayerProps {
  // ---- Source ----
  /** Video source URL or source object */
  src: VideoSource;

  // ---- Basic Options ----
  /** Auto-play the video when loaded */
  autoPlay?: boolean;
  /** Loop the video */
  loop?: boolean;
  /** Mute the video initially */
  muted?: boolean;
  /** Preload behavior */
  preload?: 'auto' | 'metadata' | 'none';
  /** Poster image URL */
  poster?: string;
  /** Initial volume (0-1) */
  volume?: number;
  /** Initial playback rate */
  playbackRate?: number;
  /** Start time in seconds */
  startTime?: number;
  /** Cross-origin attribute */
  crossOrigin?: 'anonymous' | 'use-credentials';
  /** Plays inline on mobile devices */
  playsInline?: boolean;

  // ---- Controls ----
  /** Show controls (boolean or config object) */
  controls?: boolean | ControlsConfig;
  /** Auto-hide controls after inactivity (ms, 0 to disable) */
  controlsAutoHide?: number;
  /** Keyboard shortcuts (false to disable) */
  keyboardShortcuts?: boolean | KeyboardShortcuts;
  /** Seek step in seconds for keyboard/button controls */
  seekStep?: number;
  /** Available playback speeds */
  playbackSpeeds?: number[];

  // ---- Captions ----
  /** Caption/subtitle tracks */
  captions?: CaptionTrack[];

  // ---- Chapters ----
  /** Chapter markers */
  chapters?: Chapter[];

  // ---- Playlist ----
  /** Playlist configuration */
  playlist?: PlaylistConfig;

  // ---- Theming ----
  /** Theme configuration */
  theme?: ThemeConfig;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;

  // ---- Layout ----
  /** Width of the player */
  width?: number | string;
  /** Height of the player */
  height?: number | string;
  /** Aspect ratio (e.g., '16:9', '4:3') */
  aspectRatio?: string;
  /** Enable responsive sizing */
  responsive?: boolean;

  // ---- Mini Player ----
  /** Mini player configuration */
  miniPlayer?: MiniPlayerConfig;

  // ---- Hover Preview ----
  /** Enable thumbnail preview on hover */
  hoverPreview?: boolean;
  /** Thumbnail sprite URL for hover preview */
  hoverPreviewSrc?: string;
  /** Number of thumbnails in the sprite */
  hoverPreviewCount?: number;

  // ---- Analytics Callbacks ----
  /** Called when video starts playing */
  onPlay?: (data: AnalyticsEventData) => void;
  /** Called when video is paused */
  onPause?: (data: AnalyticsEventData) => void;
  /** Called when video ends */
  onEnded?: (data: AnalyticsEventData) => void;
  /** Called when seeking */
  onSeek?: (data: SeekEventData) => void;
  /** Called on time update */
  onTimeUpdate?: (data: AnalyticsEventData) => void;
  /** Called when buffering starts */
  onBuffer?: (data: BufferEventData) => void;
  /** Called when buffer is ready */
  onBufferEnd?: (data: AnalyticsEventData) => void;
  /** Called on error */
  onError?: (data: ErrorEventData) => void;
  /** Called when video is loaded */
  onLoad?: (data: AnalyticsEventData) => void;
  /** Called when duration is available */
  onDurationChange?: (data: AnalyticsEventData) => void;
  /** Called when volume changes */
  onVolumeChange?: (data: AnalyticsEventData) => void;
  /** Called when playback rate changes */
  onPlaybackRateChange?: (data: AnalyticsEventData) => void;
  /** Called when entering fullscreen */
  onEnterFullscreen?: (data: AnalyticsEventData) => void;
  /** Called when exiting fullscreen */
  onExitFullscreen?: (data: AnalyticsEventData) => void;
  /** Called when entering PiP */
  onEnterPip?: (data: AnalyticsEventData) => void;
  /** Called when exiting PiP */
  onExitPip?: (data: AnalyticsEventData) => void;
  /** Called when ready to play */
  onReady?: (data: AnalyticsEventData) => void;

  // ---- Extensibility ----
  /** Component overrides for custom UI */
  components?: ComponentOverrides;
  /** Plugins to extend functionality */
  plugins?: Plugin[];

  // ---- Accessibility ----
  /** Accessible label for the player */
  'aria-label'?: string;
  /** Accessible description ID */
  'aria-describedby'?: string;
  /** Tab index for the player container */
  tabIndex?: number;
}

// ============================================================================
// Context Types
// ============================================================================

export interface VideoPlayerContextValue {
  state: PlayerState;
  actions: PlayerActions;
  props: VideoPlayerProps;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseVideoPlayerReturn {
  /** Current player state */
  state: PlayerState;
  /** Player actions */
  actions: PlayerActions;
  /** Ref to attach to VideoPlayer component */
  ref: React.RefObject<VideoPlayerRef>;
}

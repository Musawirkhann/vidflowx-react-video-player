# VidFlowX

A fully customizable React video player that supports all modern video player features. Play videos from direct sources (MP4, WebM, OGG), streaming formats (HLS, DASH), and social platforms (YouTube, Vimeo, Dailymotion, Facebook, TikTok).

[![npm version](https://img.shields.io/npm/v/vidflowx.svg)](https://www.npmjs.com/package/vidflowx)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Multiple Source Support**: MP4, WebM, OGG, HLS, DASH, YouTube, Vimeo, Dailymotion, Facebook, TikTok
- **Full Playback Control**: Play, pause, seek, volume, playback speed
- **Advanced Features**: Picture-in-Picture, fullscreen, captions/subtitles
- **Keyboard Shortcuts**: Fully customizable keyboard controls
- **Theming**: Light/dark themes with CSS variable customization
- **Chapters & Hotspots**: Define timestamp markers with labels
- **Playlist Support**: Video queue with auto-next
- **Hover Preview**: Thumbnail preview on progress bar hover
- **Plugin System**: Extensible architecture for custom functionality
- **Component Overrides**: Replace any UI component with your own
- **SSR Compatible**: Works with Next.js and Remix
- **Fully Typed**: Complete TypeScript support

## Installation

```bash
npm install vidflowx
# or
yarn add vidflowx
# or
pnpm add vidflowx
```

## Quick Start

```tsx
import { VideoPlayer } from 'vidflowx';
import 'vidflowx/styles.css';

function App() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      autoPlay={false}
      controls
    />
  );
}
```

## Usage Examples

### Basic Video

```tsx
<VideoPlayer src="video.mp4" />
```

### YouTube Video

```tsx
<VideoPlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
```

### HLS Stream

```tsx
<VideoPlayer src="https://example.com/stream.m3u8" />
```

### With Captions

```tsx
<VideoPlayer
  src="video.mp4"
  captions={[
    { src: '/subtitles/en.vtt', lang: 'en', label: 'English', default: true },
    { src: '/subtitles/es.vtt', lang: 'es', label: 'Spanish' },
  ]}
/>
```

### With Chapters

```tsx
<VideoPlayer
  src="video.mp4"
  chapters={[
    { startTime: 0, title: 'Introduction' },
    { startTime: 120, title: 'Main Content' },
    { startTime: 360, title: 'Conclusion' },
  ]}
/>
```

### Playlist

```tsx
<VideoPlayer
  src="video1.mp4"
  playlist={{
    items: [
      { id: '1', src: 'video1.mp4', title: 'Video 1' },
      { id: '2', src: 'video2.mp4', title: 'Video 2' },
      { id: '3', src: 'video3.mp4', title: 'Video 3' },
    ],
    autoPlayNext: true,
    loop: true,
  }}
/>
```

### Custom Theme

```tsx
<VideoPlayer
  src="video.mp4"
  theme={{
    mode: 'dark',
    colors: {
      primary: '#e11d48',
      progressFilled: '#e11d48',
    },
    borderRadius: 12,
  }}
/>
```

### Using the Hook for External Control

```tsx
import { VideoPlayer, useVideoPlayer } from 'vidflowx';

function App() {
  const { state, actions, ref } = useVideoPlayer();

  return (
    <div>
      <VideoPlayer ref={ref} src="video.mp4" />
      
      <div className="external-controls">
        <button onClick={actions.togglePlay}>
          {state.isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>
          {Math.floor(state.currentTime)}s / {Math.floor(state.duration)}s
        </span>
        <button onClick={actions.toggleMute}>
          {state.isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}
```

### Custom Controls

```tsx
const CustomPlayButton = ({ state, actions }) => (
  <button onClick={actions.togglePlay}>
    {state.isPlaying ? '⏸️' : '▶️'}
  </button>
);

<VideoPlayer
  src="video.mp4"
  components={{
    PlayButton: CustomPlayButton,
  }}
/>
```

### Analytics Callbacks

```tsx
<VideoPlayer
  src="video.mp4"
  onPlay={(data) => analytics.track('video_play', data)}
  onPause={(data) => analytics.track('video_pause', data)}
  onEnded={(data) => analytics.track('video_complete', data)}
  onSeek={(data) => analytics.track('video_seek', { from: data.fromTime, to: data.toTime })}
  onError={(data) => console.error('Video error:', data.error)}
/>
```

### With Plugin

```tsx
const analyticsPlugin = {
  name: 'analytics',
  onPlay: (context) => {
    console.log('Video started at', context.state.currentTime);
  },
  onPause: (context) => {
    console.log('Video paused at', context.state.currentTime);
  },
  onEnded: (context) => {
    console.log('Video completed');
  },
};

<VideoPlayer
  src="video.mp4"
  plugins={[analyticsPlugin]}
/>
```

## API Reference

### VideoPlayerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| VideoSourceObject` | **required** | Video source URL or source object |
| `autoPlay` | `boolean` | `false` | Auto-play when loaded |
| `loop` | `boolean` | `false` | Loop the video |
| `muted` | `boolean` | `false` | Start muted |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'metadata'` | Preload behavior |
| `poster` | `string` | - | Poster image URL |
| `volume` | `number` | `1` | Initial volume (0-1) |
| `playbackRate` | `number` | `1` | Initial playback speed |
| `startTime` | `number` | `0` | Start time in seconds |
| `controls` | `boolean \| ControlsConfig` | `true` | Show controls |
| `controlsAutoHide` | `number` | `3000` | Auto-hide delay (ms) |
| `keyboardShortcuts` | `boolean \| KeyboardShortcuts` | `true` | Enable shortcuts |
| `seekStep` | `number` | `10` | Seek step in seconds |
| `playbackSpeeds` | `number[]` | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]` | Available speeds |
| `captions` | `CaptionTrack[]` | `[]` | Caption/subtitle tracks |
| `chapters` | `Chapter[]` | `[]` | Chapter markers |
| `playlist` | `PlaylistConfig` | - | Playlist configuration |
| `theme` | `ThemeConfig` | - | Theme configuration |
| `width` | `number \| string` | - | Player width |
| `height` | `number \| string` | - | Player height |
| `aspectRatio` | `string` | `'16:9'` | Aspect ratio |
| `responsive` | `boolean` | `true` | Enable responsive sizing |
| `hoverPreview` | `boolean` | `false` | Enable hover preview |
| `plugins` | `Plugin[]` | `[]` | Plugins to load |
| `components` | `ComponentOverrides` | - | Custom components |

### VideoSourceObject

```ts
{
  type: 'file' | 'youtube' | 'vimeo' | 'dailymotion' | 'facebook' | 'tiktok' | 'hls' | 'dash';
  url: string;
}
```

### CaptionTrack

```ts
{
  src: string;      // URL to .vtt file
  lang: string;     // Language code
  label?: string;   // Display label
  default?: boolean;
}
```

### Chapter

```ts
{
  startTime: number;    // Start time in seconds
  endTime?: number;     // End time in seconds
  title: string;        // Chapter title
  description?: string; // Optional description
  thumbnail?: string;   // Optional thumbnail URL
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `←` | Seek backward |
| `→` | Seek forward |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `C` | Toggle captions |
| `P` | Toggle PiP |
| `N` | Next track |
| `B` | Previous track |
| `0-9` | Seek to percentage |

### PlayerState

```ts
{
  playbackState: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isEnded: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  bufferedPercent: number;
  playedPercent: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPip: boolean;
  activeCaptionIndex: number;
  source: VideoSource | null;
  sourceType: VideoSourceType | null;
  error: Error | null;
  controlsVisible: boolean;
  quality: string | null;
  availableQualities: string[];
}
```

### PlayerActions

```ts
{
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
  seekForward: (seconds?: number) => void;
  seekBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  enterPip: () => Promise<void>;
  exitPip: () => Promise<void>;
  togglePip: () => Promise<void>;
  setActiveCaption: (index: number) => void;
  setSource: (source: VideoSource) => void;
  setQuality: (quality: string) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  skipToTrack: (index: number) => void;
}
```

## Styling

### CSS Variables

You can customize the player appearance using CSS variables:

```css
:root {
  --vidflowx-primary: #3b82f6;
  --vidflowx-secondary: #64748b;
  --vidflowx-controls-background: rgba(0, 0, 0, 0.75);
  --vidflowx-text: #ffffff;
  --vidflowx-text-on-primary: #ffffff;
  --vidflowx-progress-background: rgba(255, 255, 255, 0.3);
  --vidflowx-progress-filled: #3b82f6;
  --vidflowx-progress-buffer: rgba(255, 255, 255, 0.5);
  --vidflowx-tooltip-background: rgba(0, 0, 0, 0.9);
  --vidflowx-tooltip-text: #ffffff;
  --vidflowx-border-radius: 8px;
  --vidflowx-control-bar-height: 48px;
  --vidflowx-icon-size: 24px;
}
```

### Theming via Props

```tsx
<VideoPlayer
  src="video.mp4"
  theme={{
    mode: 'dark', // 'light' | 'dark' | 'auto'
    colors: {
      primary: '#e11d48',
      controlsBackground: 'rgba(0, 0, 0, 0.8)',
      text: '#ffffff',
      progressFilled: '#e11d48',
    },
    borderRadius: 12,
    controlBarHeight: 56,
    iconSize: 28,
  }}
/>
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## SSR Support

VidFlowX is compatible with server-side rendering. The player handles client-side-only features gracefully:

```tsx
// Next.js App Router
'use client';

import { VideoPlayer } from 'vidflowx';
import 'vidflowx/styles.css';

export default function VideoComponent() {
  return <VideoPlayer src="video.mp4" />;
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Musawir Khan](https://github.com/musawirkhan)

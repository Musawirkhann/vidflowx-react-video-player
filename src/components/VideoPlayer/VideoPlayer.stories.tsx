import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VideoPlayer } from './VideoPlayer';

const meta: Meta<typeof VideoPlayer> = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Video source URL',
    },
    autoPlay: {
      control: 'boolean',
      description: 'Auto-play the video when loaded',
    },
    loop: {
      control: 'boolean',
      description: 'Loop the video',
    },
    muted: {
      control: 'boolean',
      description: 'Mute the video initially',
    },
    controls: {
      control: 'boolean',
      description: 'Show player controls',
    },
    poster: {
      control: 'text',
      description: 'Poster image URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample video URLs for testing
const SAMPLE_MP4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_POSTER = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg';
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const VIMEO_URL = 'https://vimeo.com/76979871';
const HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const DAILYMOTION_URL = 'https://www.dailymotion.com/video/x8m8jm4';
// Facebook video URL - must be a public video from a page that allows embedding
// Note: Facebook embedding is very restrictive and may not work on localhost
const FACEBOOK_URL = 'https://www.facebook.com/facebook/videos/10153231379946729/';
// TikTok video URL - must be a public video
const TIKTOK_URL = 'https://www.tiktok.com/@scout2015/video/6718335390845095173';

export const Default: Story = {
  args: {
    src: "https://v16-cc.capcut.com/6220f19036771799a7653e1e9d9710ce/6989a288/video/tos/alisg/tos-alisg-ve-8fe9aq-sg/oYqmLbimm8By92cEBtFEgwDzugCtfW4IQxf1Qk/?a=348188&bti=cHJ3bzFmc3dmZEBvY15taF4rcm1gYA%3D%3D&ch=0&cr=0&dr=0&lr=all&cd=0%7C0%7C0%7C0&cv=1&br=700&bt=350&cs=0&ds=3&ft=GAAO2Inz7Thbq2sPXq8Zmo&mime_type=video_mp4&qs=0&rc=aTk7OGRmOmg1ZDc8aTtkN0BpanVzZ3A5cmY3dDMzOGVkNEAuYDNiMzJjXjAxMjQ2MmM1YSM2aTZwMmRzbC5gLS1kYi1zcw%3D%3D&vvpl=1&l=20260203170140691E82ACC2FCC0A7ED6B&btag=e000b8000",
    poster: SAMPLE_POSTER,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const AutoPlay: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    autoPlay: true,
    muted: true, // Required for autoplay to work
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const YouTube: Story = {
  args: {
    src: YOUTUBE_URL,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const Vimeo: Story = {
  args: {
    src: VIMEO_URL,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const HLSStream: Story = {
  args: {
    src: HLS_URL,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCaptions: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    captions: [
      {
        src: '/subtitles/en.vtt',
        lang: 'en',
        label: 'English',
        default: true,
      },
      {
        src: '/subtitles/es.vtt',
        lang: 'es',
        label: 'Spanish',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithChapters: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    chapters: [
      { startTime: 0, title: 'Introduction', description: 'Opening scene' },
      { startTime: 60, title: 'Chapter 1', description: 'First chapter' },
      { startTime: 180, title: 'Chapter 2', description: 'Second chapter' },
      { startTime: 360, title: 'Conclusion', description: 'Final thoughts' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const LightTheme: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    theme: {
      mode: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%', background: '#f5f5f5', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomTheme: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    theme: {
      mode: 'dark',
      colors: {
        primary: '#e11d48',
        progressFilled: '#e11d48',
      },
      borderRadius: 16,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const Responsive: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    responsive: true,
    aspectRatio: '16:9',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const SmallPlayer: Story = {
  args: {
    src: SAMPLE_MP4,
    poster: SAMPLE_POSTER,
    controls: true,
    width: 400,
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export const Dailymotion: Story = {
  args: {
    src: DAILYMOTION_URL,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const Facebook: Story = {
  args: {
    src: FACEBOOK_URL,
    controls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const TikTok: Story = {
  args: {
    src: TIKTOK_URL,
    controls: true,
    aspectRatio: '9:16', // TikTok videos are vertical
  },
  decorators: [
    (Story) => (
      <div style={{ width: '350px', maxWidth: '100%', height: '620px' }}>
        <Story />
      </div>
    ),
  ],
};

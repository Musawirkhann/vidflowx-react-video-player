import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatTimeVerbose,
  parseTime,
  getPlayedPercent,
  getBufferedPercent,
} from './formatTime';

describe('formatTime', () => {
  it('should format seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(3600)).toBe('1:00:00');
    expect(formatTime(3661)).toBe('1:01:01');
    expect(formatTime(7325)).toBe('2:02:05');
  });

  it('should handle edge cases', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
    expect(formatTime(-30)).toBe('-0:30');
  });
});

describe('formatTimeVerbose', () => {
  it('should format time verbosely', () => {
    expect(formatTimeVerbose(0)).toBe('0s');
    expect(formatTimeVerbose(30)).toBe('30s');
    expect(formatTimeVerbose(60)).toBe('1m');
    expect(formatTimeVerbose(90)).toBe('1m 30s');
    expect(formatTimeVerbose(3600)).toBe('1h');
    expect(formatTimeVerbose(3661)).toBe('1h 1m 1s');
  });
});

describe('parseTime', () => {
  it('should parse colon format', () => {
    expect(parseTime('0:30')).toBe(30);
    expect(parseTime('1:00')).toBe(60);
    expect(parseTime('1:30')).toBe(90);
    expect(parseTime('1:00:00')).toBe(3600);
    expect(parseTime('1:01:01')).toBe(3661);
  });

  it('should parse verbose format', () => {
    expect(parseTime('30s')).toBe(30);
    expect(parseTime('1m')).toBe(60);
    expect(parseTime('1m 30s')).toBe(90);
    expect(parseTime('1h')).toBe(3600);
    expect(parseTime('1h 1m 1s')).toBe(3661);
  });
});

describe('getPlayedPercent', () => {
  it('should calculate played percentage', () => {
    expect(getPlayedPercent(0, 100)).toBe(0);
    expect(getPlayedPercent(50, 100)).toBe(50);
    expect(getPlayedPercent(100, 100)).toBe(100);
    expect(getPlayedPercent(25, 100)).toBe(25);
  });

  it('should handle edge cases', () => {
    expect(getPlayedPercent(0, 0)).toBe(0);
    expect(getPlayedPercent(50, 0)).toBe(0);
    expect(getPlayedPercent(-10, 100)).toBe(0);
  });
});

describe('getBufferedPercent', () => {
  it('should return 0 for null buffered', () => {
    expect(getBufferedPercent(null, 100)).toBe(0);
  });

  it('should return 0 for empty buffered ranges', () => {
    const emptyBuffered = {
      length: 0,
      start: () => 0,
      end: () => 0,
    } as unknown as TimeRanges;
    expect(getBufferedPercent(emptyBuffered, 100)).toBe(0);
  });
});

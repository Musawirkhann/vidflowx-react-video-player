/**
 * Time Formatting Utilities
 */

/**
 * Format seconds into a time string (e.g., "1:23:45" or "3:45")
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0:00';
  }

  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const prefix = seconds < 0 ? '-' : '';

  if (hours > 0) {
    return `${prefix}${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${prefix}${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds into a verbose time string (e.g., "1h 23m 45s")
 */
export function formatTimeVerbose(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0s';
  }

  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

/**
 * Parse a time string into seconds
 * Supports formats: "1:23:45", "3:45", "45", "1h23m45s"
 */
export function parseTime(timeString: string): number {
  // Handle verbose format (1h23m45s)
  const verboseMatch = timeString.match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  if (verboseMatch && (verboseMatch[1] || verboseMatch[2] || verboseMatch[3])) {
    const hours = parseInt(verboseMatch[1] || '0', 10);
    const minutes = parseInt(verboseMatch[2] || '0', 10);
    const seconds = parseInt(verboseMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Handle colon format (1:23:45 or 3:45)
  const parts = timeString.split(':').map(p => parseInt(p.trim(), 10));
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1 && !isNaN(parts[0])) {
    return parts[0];
  }

  return 0;
}

/**
 * Calculate percentage from current time and duration
 */
export function getPlayedPercent(currentTime: number, duration: number): number {
  if (!duration || duration === 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

/**
 * Calculate buffered percentage from TimeRanges
 */
export function getBufferedPercent(buffered: TimeRanges | null, duration: number): number {
  if (!buffered || buffered.length === 0 || !duration) return 0;
  
  // Get the end of the last buffered range
  const bufferedEnd = buffered.end(buffered.length - 1);
  return Math.min(100, Math.max(0, (bufferedEnd / duration) * 100));
}

/**
 * Find the buffered range that contains a specific time
 */
export function getBufferedRangeAt(buffered: TimeRanges | null, time: number): { start: number; end: number } | null {
  if (!buffered) return null;

  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);
    if (time >= start && time <= end) {
      return { start, end };
    }
  }

  return null;
}

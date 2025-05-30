/**
 * Extracts the YouTube video ID from a YouTube URL
 * @param url The YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
 * @returns The YouTube video ID or empty string if not found
 */
export function getYouTubeId(url?: string): string {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

/**
 * Generates the YouTube thumbnail URL for a video ID
 * @param videoId The YouTube video ID
 * @returns The URL for the maxresdefault thumbnail
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
} 
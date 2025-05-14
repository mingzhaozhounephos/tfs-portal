import React from 'react';

interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  created_at: string | Date;
  duration: string;
  assigned_date?: string | Date;
  last_watched?: string | Date;
  youtube_url?: string;
}

interface TrainingVideosGridProps {
  videos: TrainingVideo[];
  onStartTraining?: (video: TrainingVideo) => void;
}

function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getYouTubeId(url?: string) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

export function TrainingVideosGrid({ videos, onStartTraining }: TrainingVideosGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {videos.map(video => {
        const youtubeId = getYouTubeId(video.youtube_url);
        return (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border"
          >
            <div className="font-bold text-base mb-1">{video.title}</div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block text-xs font-semibold rounded-full px-3 py-0.5
                  ${
                    video.category?.toLowerCase() === 'office'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : video.category?.toLowerCase() === 'truck'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : video.category?.toLowerCase() === 'van'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                style={{ minWidth: 'fit-content' }}
              >
                {video.category}
              </span>
            </div>
            <div
              className="text-xs text-gray-600 mb-2 line-clamp-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {video.description}
            </div>
            <div className="relative aspect-video rounded overflow-hidden mb-2">
              <img
                src={youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : video.image}
                alt={video.title}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <button
                className="absolute inset-0 flex items-center justify-center"
                tabIndex={-1}
                aria-label="Play video"
                type="button"
                disabled
              >
                <span className="bg-white/80 rounded-full p-2">
                  <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><polygon points="13,11 23,16 13,21" fill="#fff"/></svg>
                </span>
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg width="16" height="16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2"/></svg>
                {formatDate(video.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="2"/></svg>
                {video.duration}
              </span>
            </div>
            {video.last_watched && (
              <div className="text-xs text-gray-500 mt-1">
                Last watched: {formatDate(video.last_watched)}
              </div>
            )}
            <button
              className="mt-2 w-full bg-black text-white rounded py-2 text-sm font-medium"
              onClick={() => onStartTraining?.(video)}
            >
              Start Training
            </button>
          </div>
        );
      })}
    </div>
  );
} 
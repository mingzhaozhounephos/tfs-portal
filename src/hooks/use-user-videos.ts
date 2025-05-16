import { useEffect } from 'react';
import { useUserVideosStore } from '@/store/user-videos-store';
import { UserVideo, UserStats } from '@/types';

export function useUserVideos(userId: string) {
  const {
    userVideos,
    stats,
    loading,
    error,
    initialize,
    refresh,
    assignVideos
  } = useUserVideosStore();

  useEffect(() => {
    initialize(userId);
  }, [userId, initialize]);

  return {
    videos: userVideos[userId] || [],
    stats: stats[userId] || { numAssigned: 0, completion: 0 },
    loading: loading[userId] || false,
    error: error[userId] || null,
    refresh: () => refresh(userId),
    assignVideos
  };
} 
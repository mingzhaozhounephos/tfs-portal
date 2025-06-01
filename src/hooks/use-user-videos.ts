"use client";

import { useEffect } from "react";
import { useUserVideosStore } from "@/store/user-videos-store";
import { UserVideoWithVideo } from "@/types";

interface UserVideosState {
  userVideos: Record<string, UserVideoWithVideo[]>;
  stats: Record<string, { numAssigned: number; completion: number }>;
  loading: Record<string, boolean>;
  error: Record<string, Error | null>;
  initialize: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  assignVideos: (userId: string, videoIds: string[]) => Promise<void>;
}

export function useUserVideos(userId: string) {
  const userVideos = useUserVideosStore((state) => state.userVideos);
  const stats = useUserVideosStore((state) => state.stats);
  const loading = useUserVideosStore((state) => state.loading);
  const error = useUserVideosStore((state) => state.error);
  const initialize = useUserVideosStore((state) => state.initialize);
  const refresh = useUserVideosStore((state) => state.refresh);
  const assignVideos = useUserVideosStore((state) => state.assignVideos);

  useEffect(() => {
    initialize(userId);
  }, [userId, initialize]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh(userId);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh, userId]);

  return {
    videos: userVideos[userId] || [],
    stats: stats[userId] || { numAssigned: 0, completion: 0 },
    loading: loading[userId] || false,
    error: error[userId] || null,
    refresh: () => refresh(userId),
    assignVideos,
  };
}

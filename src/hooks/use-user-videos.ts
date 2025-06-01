"use client";

import { useEffect } from "react";
import { useUserVideosStore } from "@/store/user-videos-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
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
  const {
    userVideos,
    stats,
    loading,
    error,
    initialize,
    refresh,
    assignVideos,
  } = useUserVideosStore(
    (state) => ({
      userVideos: state.userVideos,
      stats: state.stats,
      loading: state.loading,
      error: state.error,
      initialize: state.initialize,
      refresh: state.refresh,
      assignVideos: state.assignVideos,
    }),
    shallow
  );

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

import { useEffect } from "react";
import { useVideosStore } from "@/store/videos-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { Video } from "@/types";

interface VideosState {
  videos: Video[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchVideos: (query: string) => Promise<void>;
  getVideoById: (id: string) => Video | undefined;
}

export function useVideos() {
  const {
    videos,
    loading,
    error,
    initialize,
    refresh,
    searchVideos,
    getVideoById,
  } = useVideosStore(
    (state) => ({
      videos: state.videos,
      loading: state.loading,
      error: state.error,
      initialize: state.initialize,
      refresh: state.refresh,
      searchVideos: state.searchVideos,
      getVideoById: state.getVideoById,
    }),
    shallow
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { videos, loading, error, searchVideos, getVideoById, refresh };
}

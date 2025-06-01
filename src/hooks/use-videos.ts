import { useEffect } from "react";
import { useVideosStore } from "@/store/videos-store";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

export function useVideos() {
  const videos = useVideosStore((state) => state.videos);
  const loading = useVideosStore((state) => state.loading);
  const error = useVideosStore((state) => state.error);
  const initialize = useVideosStore((state) => state.initialize);
  const refresh = useVideosStore((state) => state.refresh);
  const searchVideos = useVideosStore((state) => state.searchVideos);
  const getVideoById = useVideosStore((state) => state.getVideoById);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { videos, loading, error, searchVideos, getVideoById, refresh };
}

import { useEffect } from "react";
import { useVideosStore } from "@/store/videos-store";

export function useVideos() {
  const {
    videos,
    loading,
    error,
    initialize,
    refresh,
    searchVideos,
    getVideoById,
  } = useVideosStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    videos,
    loading,
    error,
    searchVideos,
    getVideoById,
    refresh,
  };
}

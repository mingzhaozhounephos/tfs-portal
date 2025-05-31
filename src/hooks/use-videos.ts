import { useEffect, useCallback } from "react";
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

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoize the refresh callback to prevent unnecessary re-renders
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, refreshing videos...");
      refresh();
    }
  }, [refresh]);

  // Handle visibility changes
  useEffect(() => {
    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    videos,
    loading,
    error,
    searchVideos,
    getVideoById,
    refresh,
  };
}

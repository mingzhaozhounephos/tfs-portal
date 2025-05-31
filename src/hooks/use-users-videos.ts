import { useEffect, useCallback } from "react";
import { useUsersVideosStore } from "@/store/users-videos-store";

export function useUsersVideos() {
  const {
    assignments,
    loading,
    error,
    initialize,
    refresh,
    getAssignmentsForVideo,
    assignVideos,
  } = useUsersVideosStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoize the refresh callback to prevent unnecessary re-renders
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, refreshing user video assignments...");
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
    assignments,
    loading,
    error,
    getAssignmentsForVideo,
    assignVideos,
    refresh,
  };
}

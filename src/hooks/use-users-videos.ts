import { useEffect, useCallback, useRef } from "react";
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

  // Use a ref to track if we're already refreshing
  const isRefreshing = useRef(false);
  // Use a ref to track the last refresh time
  const lastRefreshTime = useRef(0);
  // Minimum time between refreshes (2 seconds)
  const MIN_REFRESH_INTERVAL = 2000;

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoize the refresh callback with debouncing
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      const now = Date.now();
      // Only refresh if we're not already refreshing and enough time has passed
      if (
        !isRefreshing.current &&
        now - lastRefreshTime.current > MIN_REFRESH_INTERVAL
      ) {
        isRefreshing.current = true;
        lastRefreshTime.current = now;

        refresh().finally(() => {
          isRefreshing.current = false;
        });
      }
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

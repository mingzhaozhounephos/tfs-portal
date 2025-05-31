import { useEffect, useCallback, useRef } from "react";
import { useDriverUsersVideosStore } from "@/store/driver-users-videos-store";
import { useAuth } from "./use-auth";

export function useDriverUsersVideos() {
  const {
    assignments,
    loading,
    error,
    initialize,
    refresh,
    getAssignmentById,
  } = useDriverUsersVideosStore();

  const { user } = useAuth();
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  const MIN_REFRESH_INTERVAL = 2000;

  // Initialize on mount
  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [initialize, user?.id]);

  // Memoize the refresh callback with debouncing
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible" && user?.id) {
      const now = Date.now();
      if (
        !isRefreshing.current &&
        now - lastRefreshTime.current > MIN_REFRESH_INTERVAL
      ) {
        isRefreshing.current = true;
        lastRefreshTime.current = now;

        refresh(user.id).finally(() => {
          isRefreshing.current = false;
        });
      }
    }
  }, [refresh, user?.id]);

  // Handle visibility changes
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    assignments,
    loading,
    error,
    getAssignmentById,
    refresh: user?.id ? () => refresh(user.id) : undefined,
  };
}

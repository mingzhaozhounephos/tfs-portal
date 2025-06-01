import { useEffect } from "react";
import { useDriverUsersVideosStore } from "@/store/driver-users-videos-store";
import { useAuth } from "./use-auth";

export function useDriverUsersVideos() {
  const { user } = useAuth();
  const assignments = useDriverUsersVideosStore((state) => state.assignments);
  const loading = useDriverUsersVideosStore((state) => state.loading);
  const error = useDriverUsersVideosStore((state) => state.error);
  const initialize = useDriverUsersVideosStore((state) => state.initialize);
  const refresh = useDriverUsersVideosStore((state) => state.refresh);

  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [initialize, user?.id]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && user?.id) {
        refresh(user.id);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh, user?.id]);

  return { assignments, loading, error };
}

import { useEffect } from "react";
import { useDriverUsersVideosStore } from "@/store/driver-users-videos-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { UserVideoWithVideo } from "@/types";
import { useAuth } from "./use-auth";

interface DriverUsersVideosState {
  assignments: UserVideoWithVideo[];
  loading: boolean;
  error: Error | null;
  initialize: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
}

export function useDriverUsersVideos() {
  const { user } = useAuth();
  const { assignments, loading, error, initialize, refresh } =
    useDriverUsersVideosStore(
      (state) => ({
        assignments: state.assignments,
        loading: state.loading,
        error: state.error,
        initialize: state.initialize,
        refresh: state.refresh,
      }),
      shallow
    );

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

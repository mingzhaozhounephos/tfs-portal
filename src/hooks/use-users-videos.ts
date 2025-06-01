import { useEffect } from "react";
import { useUsersVideosStore } from "@/store/users-videos-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { UserVideoWithVideo } from "@/types";

interface UsersVideosState {
  assignments: UserVideoWithVideo[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  getAssignmentsForVideo: (videoId: string) => UserVideoWithVideo[];
  assignVideos: (userId: string, videoIds: string[]) => Promise<void>;
}

export function useUsersVideos() {
  const {
    assignments,
    loading,
    error,
    initialize,
    refresh,
    getAssignmentsForVideo,
    assignVideos,
  } = useUsersVideosStore(
    (state) => ({
      assignments: state.assignments,
      loading: state.loading,
      error: state.error,
      initialize: state.initialize,
      refresh: state.refresh,
      getAssignmentsForVideo: state.getAssignmentsForVideo,
      assignVideos: state.assignVideos,
    }),
    shallow
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { assignments, loading, error, getAssignmentsForVideo, assignVideos };
}

import { useEffect } from "react";
import { useUsersVideosStore } from "@/store/users-videos-store";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

export function useUsersVideos() {
  const assignments = useUsersVideosStore((state) => state.assignments);
  const loading = useUsersVideosStore((state) => state.loading);
  const error = useUsersVideosStore((state) => state.error);
  const initialize = useUsersVideosStore((state) => state.initialize);
  const refresh = useUsersVideosStore((state) => state.refresh);
  const getAssignmentsForVideo = useUsersVideosStore(
    (state) => state.getAssignmentsForVideo
  );
  const assignVideos = useUsersVideosStore((state) => state.assignVideos);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { assignments, loading, error, getAssignmentsForVideo, assignVideos };
}

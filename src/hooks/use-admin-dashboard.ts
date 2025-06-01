import { useEffect } from "react";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

interface AdminDashboardState {
  stats: {
    totalUsers: number;
    totalVideos: number;
    totalAssignments: number;
    completionRate: number;
  };
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAdminDashboard() {
  const { stats, loading, error, initialize, refresh } = useAdminDashboardStore(
    (state) => ({
      stats: state.stats,
      loading: state.loading,
      error: state.error,
      initialize: state.initialize,
      refresh: state.refresh,
    }),
    shallow
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { stats, loading, error };
}

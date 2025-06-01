import { useEffect } from "react";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

export function useAdminDashboard() {
  const stats = useAdminDashboardStore((state) => state.stats);
  const loading = useAdminDashboardStore((state) => state.loading);
  const error = useAdminDashboardStore((state) => state.error);
  const initialize = useAdminDashboardStore((state) => state.initialize);
  const refresh = useAdminDashboardStore((state) => state.refresh);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { stats, loading, error };
}

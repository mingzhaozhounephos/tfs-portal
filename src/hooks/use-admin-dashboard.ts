import { useEffect, useCallback } from "react";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

// Debounce duration in milliseconds (2 seconds)
const DEBOUNCE_DURATION = 2000;

export function useAdminDashboard() {
  const { stats, loading, error, initialize, refresh } =
    useAdminDashboardStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  }, [refresh]);

  // Handle visibility changes
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

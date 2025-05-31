import { useEffect, useCallback } from "react";
import { useAdminDashboardStore } from "@/store/admin-dashboard-store";

export function useAdminDashboard() {
  const { stats, loading, error, initialize, refresh } =
    useAdminDashboardStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoize the refresh callback to prevent unnecessary re-renders
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, refreshing dashboard stats...");
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
    stats,
    loading,
    error,
    refresh,
  };
}

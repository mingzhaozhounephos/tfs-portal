import { useEffect } from "react";
import { useUserStatsStore } from "@/store/user-stats-store";
import { UserWithRole } from "@/types";

export function useUserStats(users: UserWithRole[]) {
  const { stats, loading, error, initialize, refresh } = useUserStatsStore();

  useEffect(() => {
    if (users.length > 0) {
      initialize(users);
    }

    // Cleanup subscription on unmount
    return () => {
      const cleanup = useUserStatsStore.getState().cleanup;
      if (cleanup) cleanup();
    };
  }, [users, initialize]);

  // Refresh stats when users change
  useEffect(() => {
    if (users.length > 0) {
      refresh(users);
    }
  }, [users, refresh]);

  return {
    stats,
    loading,
    error,
  };
}

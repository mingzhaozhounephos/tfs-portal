import { useEffect } from "react";
import { useUserStatsStore } from "@/store/user-stats-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { UserWithRole } from "@/types";

interface UserStatsState {
  stats: Record<string, { numAssigned: number; completion: number }>;
  loading: boolean;
  error: Error | null;
  initialize: (users: UserWithRole[]) => Promise<void>;
  refresh: (users: UserWithRole[]) => Promise<void>;
}

export function useUserStats(users: UserWithRole[]) {
  const { stats, loading, error, initialize, refresh } = useUserStatsStore(
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
    if (users.length > 0) {
      initialize(users);
    }
  }, [users, initialize]);

  useEffect(() => {
    if (users.length > 0) {
      refresh(users);
    }
  }, [users, refresh]);

  return { stats, loading, error };
}

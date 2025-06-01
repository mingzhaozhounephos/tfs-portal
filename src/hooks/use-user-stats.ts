import { useEffect } from "react";
import { useUserStatsStore } from "@/store/user-stats-store";
import { UserWithRole } from "@/types";

interface UserStatsState {
  stats: Record<string, { numAssigned: number; completion: number }>;
  loading: boolean;
  error: Error | null;
  initialize: (users: UserWithRole[]) => Promise<void>;
  refresh: (users: UserWithRole[]) => Promise<void>;
}

export function useUserStats(users: UserWithRole[]) {
  const stats = useUserStatsStore((state) => state.stats);
  const loading = useUserStatsStore((state) => state.loading);
  const error = useUserStatsStore((state) => state.error);
  const initialize = useUserStatsStore((state) => state.initialize);
  const refresh = useUserStatsStore((state) => state.refresh);

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

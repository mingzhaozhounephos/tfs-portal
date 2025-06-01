import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserStats } from "@/types";
import { UserWithRole } from "@/types";

interface UserStatsMap {
  [userId: string]: UserStats;
}

interface UserStatsStore {
  stats: UserStatsMap;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: (users: UserWithRole[]) => Promise<void>;
  refresh: (users: UserWithRole[]) => Promise<void>;
}

async function fetchUserStats(users: UserWithRole[]) {
  const { data, error } = await supabase
    .from("users_videos")
    .select("user, is_completed");

  if (error) throw error;

  // Calculate stats for each user
  const stats: UserStatsMap = {};
  users.forEach((user) => {
    const userVideos = data.filter((uv) => uv.user === user.id);
    const numAssigned = userVideos.length;
    const completed = userVideos.filter((uv) => uv.is_completed).length;
    const completion =
      numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

    stats[user.id] = { numAssigned, completion };
  });

  return stats;
}

export const useUserStatsStore = create<UserStatsStore>((set, get) => ({
  stats: {},
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async (users: UserWithRole[]) => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      const stats = await fetchUserStats(users);

      // Subscribe to real-time changes
      const channel = supabase
        .channel("users-videos-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users_videos" },
          async () => {
            const newStats = await fetchUserStats(users);
            set({ stats: newStats });
          }
        )
        .subscribe();

      set({
        stats,
        loading: false,
        initialized: true,
        cleanup: () => supabase.removeChannel(channel),
      });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },

  refresh: async (users: UserWithRole[]) => {
    if (!get().initialized) return;

    set({ loading: true });
    try {
      const stats = await fetchUserStats(users);
      set({ stats, loading: false });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },
}));

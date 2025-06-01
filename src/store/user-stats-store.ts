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

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000; // 3 seconds

export const useUserStatsStore = create<UserStatsStore>((set, get) => ({
  stats: {},
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async (users: UserWithRole[]) => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh(users);

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

    set({ cleanup: () => supabase.removeChannel(channel) });
  },

  refresh: async (users: UserWithRole[]) => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) return;
    lastRefresh = now;

    set({ loading: true });
    try {
      const stats = await fetchUserStats(users);
      set({ stats, loading: false, error: null });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },
}));

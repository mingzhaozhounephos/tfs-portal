import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserVideoWithVideo } from "@/types";

interface DriverUsersVideosStore {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  assignments: UserVideoWithVideo[];
  cleanup?: () => void;
  initialize: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  getAssignmentById: (id: string) => UserVideoWithVideo | undefined;
}

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000;

// Helper function to fetch driver user videos
async function fetchDriverUserVideos(userId: string) {
  const { data, error } = await supabase
    .from("users_videos")
    .select(
      `
      *,
      video:videos(*)
    `
    )
    .eq("user", userId)
    .order("modified_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export const useDriverUsersVideosStore = create<DriverUsersVideosStore>(
  (set, get) => ({
    initialized: false,
    loading: false,
    error: null,
    assignments: [],
    cleanup: undefined,

    initialize: async (userId: string) => {
      if (get().initialized) return;
      set({ initialized: true });
      await get().refresh(userId);
      const channel = supabase
        .channel("driver-users-videos-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users_videos",
            filter: `user=eq.${userId}`,
          },
          async () => {
            const assignments = await fetchDriverUserVideos(userId);
            set({ assignments });
          }
        )
        .subscribe();
      set({ cleanup: () => supabase.removeChannel(channel) });
    },

    refresh: async (userId: string) => {
      const now = Date.now();
      if (now - lastRefresh < REFRESH_THROTTLE) return;
      lastRefresh = now;
      set({ loading: true });
      try {
        const assignments = await fetchDriverUserVideos(userId);
        set({ assignments, loading: false, error: null });
      } catch (err) {
        set({ loading: false, error: err as Error });
      }
    },

    getAssignmentById: (id: string) => {
      return get().assignments.find((assignment) => assignment.id === id);
    },
  })
);

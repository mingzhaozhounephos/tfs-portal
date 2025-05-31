import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserVideoWithVideo } from "@/types";

interface DriverUsersVideosStore {
  assignments: UserVideoWithVideo[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  getAssignmentById: (id: string) => UserVideoWithVideo | undefined;
}

// Helper function to fetch user's video assignments
async function fetchUserVideoAssignments(userId: string) {
  // Add timeout to the query
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Query timeout after 10 seconds")),
      10000
    );
  });

  const queryPromise = supabase
    .from("users_videos")
    .select(
      `
      *,
      user:users(*),
      video:videos(*)
    `
    )
    .eq("user", userId)
    .order("created_at", { ascending: false });

  // Race between the query and timeout
  const { data, error } = (await Promise.race([
    queryPromise,
    timeoutPromise.then(() => ({
      data: null,
      error: new Error("Query timeout"),
    })),
  ])) as { data: any; error: any };

  if (error) throw error;
  if (!data) throw new Error("No data returned from query");

  return data as UserVideoWithVideo[];
}

export const useDriverUsersVideosStore = create<DriverUsersVideosStore>(
  (set, get) => ({
    assignments: [],
    loading: false,
    error: null,
    initialized: false,
    cleanup: undefined,

    initialize: async (userId: string) => {
      if (get().initialized) return;

      set({ loading: true });
      try {
        const assignments = await fetchUserVideoAssignments(userId);

        set({
          assignments,
          initialized: true,
          loading: false,
        });

        // Set up real-time subscription for changes to this user's assignments
        const channel = supabase
          .channel("driver-videos-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "users_videos",
              filter: `user=eq.${userId}`,
            },
            async () => {
              const assignments = await fetchUserVideoAssignments(userId);
              set({ assignments });
            }
          )
          .subscribe();

        set({ cleanup: () => supabase.removeChannel(channel) });
      } catch (err) {
        set({
          error: err as Error,
          loading: false,
        });
      }
    },

    refresh: async (userId: string) => {
      set({ loading: true });
      try {
        const assignments = await fetchUserVideoAssignments(userId);
        set({
          assignments,
          loading: false,
          error: null,
        });
      } catch (err) {
        set({
          error: err as Error,
          loading: false,
        });
      }
    },

    getAssignmentById: (id: string) => {
      const { assignments } = get();
      return assignments.find((assignment) => assignment.id === id);
    },
  })
);

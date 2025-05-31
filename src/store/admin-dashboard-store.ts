import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface AdminDashboardStats {
  // Video stats
  totalVideos: number;
  videosThisWeek: number;
  // User stats
  totalUsers: number;
  usersThisMonth: number;
  // Completion stats
  completionRate: number;
  // Watch stats
  totalVideosWatched: number;
  videosWatchedThisWeek: number;
}

interface AdminDashboardStore {
  stats: AdminDashboardStats;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Helper function to fetch dashboard stats
async function fetchDashboardStats() {
  try {
    // Get the start and end of the current week (Sunday to Saturday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get the start and end of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get total counts first
    const [totalVideosResult, totalUsersResult] = await Promise.all([
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ]);

    if (totalVideosResult.error) throw totalVideosResult.error;
    if (totalUsersResult.error) throw totalUsersResult.error;

    // Get videos this week
    const videosThisWeekResult = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfWeek.toISOString())
      .lt("created_at", endOfWeek.toISOString());

    // Get users this month
    const usersThisMonthResult = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())
      .lt("created_at", endOfMonth.toISOString());

    // Get users_videos stats
    const [totalAssignmentsResult, completedAssignmentsResult] =
      await Promise.all([
        supabase
          .from("users_videos")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("users_videos")
          .select("*", { count: "exact", head: true })
          .eq("is_completed", true),
      ]);

    // Get watched videos stats
    const [watchedResult, weeklyWatchedResult] = await Promise.all([
      supabase
        .from("users_videos")
        .select("*", { count: "exact", head: true })
        .in("last_action", ["watch", "completed"]),
      supabase
        .from("users_videos")
        .select("*", { count: "exact", head: true })
        .gte("last_watched", startOfWeek.toISOString())
        .lt("last_watched", endOfWeek.toISOString()),
    ]);

    if (videosThisWeekResult.error) throw videosThisWeekResult.error;
    if (usersThisMonthResult.error) throw usersThisMonthResult.error;
    if (totalAssignmentsResult.error) throw totalAssignmentsResult.error;
    if (completedAssignmentsResult.error)
      throw completedAssignmentsResult.error;
    if (watchedResult.error) throw watchedResult.error;
    if (weeklyWatchedResult.error) throw weeklyWatchedResult.error;

    const totalAssignments = totalAssignmentsResult.count || 0;
    const completedAssignments = completedAssignmentsResult.count || 0;

    return {
      totalVideos: totalVideosResult.count || 0,
      videosThisWeek: videosThisWeekResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      usersThisMonth: usersThisMonthResult.count || 0,
      completionRate: totalAssignments
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0,
      totalVideosWatched: watchedResult.count || 0,
      videosWatchedThisWeek: weeklyWatchedResult.count || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export const useAdminDashboardStore = create<AdminDashboardStore>(
  (set, get) => ({
    stats: {
      totalVideos: 0,
      videosThisWeek: 0,
      totalUsers: 0,
      usersThisMonth: 0,
      completionRate: 0,
      totalVideosWatched: 0,
      videosWatchedThisWeek: 0,
    },
    loading: false,
    error: null,
    initialized: false,
    cleanup: undefined,

    initialize: async () => {
      if (get().initialized) return;

      set({ loading: true });
      try {
        const stats = (await Promise.race([
          fetchDashboardStats(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout")), 10000)
          ),
        ])) as AdminDashboardStats;

        set({
          stats,
          initialized: true,
          loading: false,
        });

        // Set up real-time subscription
        const channel = supabase
          .channel("admin-dashboard-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "videos" },
            async () => {
              try {
                const stats = await fetchDashboardStats();
                set({ stats });
              } catch (error) {
                console.error(
                  "Error updating stats after videos change:",
                  error
                );
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users" },
            async () => {
              try {
                const stats = await fetchDashboardStats();
                set({ stats });
              } catch (error) {
                console.error(
                  "Error updating stats after users change:",
                  error
                );
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users_videos" },
            async () => {
              try {
                const stats = await fetchDashboardStats();
                set({ stats });
              } catch (error) {
                console.error(
                  "Error updating stats after users_videos change:",
                  error
                );
              }
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

    refresh: async () => {
      set({ loading: true });
      try {
        const stats = (await Promise.race([
          fetchDashboardStats(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout")), 10000)
          ),
        ])) as AdminDashboardStats;

        set({
          stats,
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
  })
);

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

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

interface QueryResult {
  data: {
    total_count: number;
    weekly_count?: number;
    monthly_count?: number;
    completed_count?: number;
    watched_count?: number;
    weekly_watched_count?: number;
  } | null;
  error: Error | null;
}

interface CountResult {
  count: number | null;
  error: Error | null;
}

// Helper function to fetch dashboard stats
async function fetchDashboardStats() {
  // Add timeout to the query
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Query timeout after 10 seconds")),
      10000
    );
  });

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

  // Single query to get all video stats
  const videosQuery = supabase
    .from("videos")
    .select(
      `
      total_count:count,
      weekly_count:count
    `,
      { count: "exact" }
    )
    .gte("created_at", startOfWeek.toISOString())
    .lt("created_at", endOfWeek.toISOString())
    .single();

  // Single query to get all user stats
  const usersQuery = supabase
    .from("users")
    .select(
      `
      total_count:count,
      monthly_count:count
    `,
      { count: "exact" }
    )
    .gte("created_at", startOfMonth.toISOString())
    .lt("created_at", endOfMonth.toISOString())
    .single();

  // Get total counts first
  const [totalVideosResult, totalUsersResult] = await Promise.all([
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
  ]);

  if (totalVideosResult.error) throw totalVideosResult.error;
  if (totalUsersResult.error) throw totalUsersResult.error;

  // Get users_videos stats with proper filters
  const totalAssignmentsQuery = supabase
    .from("users_videos")
    .select("*", { count: "exact" });

  const completedAssignmentsQuery = supabase
    .from("users_videos")
    .select("*", { count: "exact" })
    .eq("is_completed", true);

  // Get watched videos count
  const watchedQuery = supabase
    .from("users_videos")
    .select("*", { count: "exact" })
    .in("last_action", ["watched", "completed"]);

  // Get weekly watched videos count
  const weeklyWatchedQuery = supabase
    .from("users_videos")
    .select("*", { count: "exact" })
    .gte("last_watched", startOfWeek.toISOString())
    .lt("last_watched", endOfWeek.toISOString());

  // Race between the queries and timeout
  const [
    videosResult,
    usersResult,
    totalAssignmentsResult,
    completedAssignmentsResult,
    watchedResult,
    weeklyWatchedResult,
  ] = await Promise.all([
    Promise.race([videosQuery, timeoutPromise]) as Promise<QueryResult>,
    Promise.race([usersQuery, timeoutPromise]) as Promise<QueryResult>,
    Promise.race([totalAssignmentsQuery, timeoutPromise]) as Promise<{
      count: number | null;
      error: Error | null;
    }>,
    Promise.race([completedAssignmentsQuery, timeoutPromise]) as Promise<{
      count: number | null;
      error: Error | null;
    }>,
    Promise.race([watchedQuery, timeoutPromise]) as Promise<{
      count: number | null;
      error: Error | null;
    }>,
    Promise.race([weeklyWatchedQuery, timeoutPromise]) as Promise<{
      count: number | null;
      error: Error | null;
    }>,
  ]);

  if (videosResult.error) throw videosResult.error;
  if (usersResult.error) throw usersResult.error;
  if (totalAssignmentsResult.error) throw totalAssignmentsResult.error;
  if (completedAssignmentsResult.error) throw completedAssignmentsResult.error;
  if (watchedResult.error) throw watchedResult.error;
  if (weeklyWatchedResult.error) throw weeklyWatchedResult.error;

  const videos = videosResult.data;
  const users = usersResult.data;

  if (!videos || !users) {
    throw new Error("No data returned from queries");
  }

  const totalAssignments = totalAssignmentsResult.count || 0;
  const completedAssignments = completedAssignmentsResult.count || 0;

  return {
    totalVideos: totalVideosResult.count || 0,
    videosThisWeek: videos.weekly_count || 0,
    totalUsers: totalUsersResult.count || 0,
    usersThisMonth: users.monthly_count || 0,
    completionRate: totalAssignments
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0,
    totalVideosWatched: watchedResult.count || 0,
    videosWatchedThisWeek: weeklyWatchedResult.count || 0,
  };
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
        const stats = await fetchDashboardStats();

        set({
          stats,
          initialized: true,
          loading: false,
        });

        // Set up real-time subscriptions for all relevant tables
        const channel = supabase
          .channel("admin-dashboard-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "videos" },
            async () => {
              const stats = await fetchDashboardStats();
              set({ stats });
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users" },
            async () => {
              const stats = await fetchDashboardStats();
              set({ stats });
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users_videos" },
            async () => {
              const stats = await fetchDashboardStats();
              set({ stats });
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
        const stats = await fetchDashboardStats();
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

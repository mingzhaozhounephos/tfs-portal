import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { DashboardStats } from "@/types";

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Fetch initial data
      const [
        totalVideosResponse,
        videosThisWeekResponse,
        totalUsersResponse,
        usersThisMonthResponse,
        completionRateResponse,
        videosWatchedResponse,
        videosWatchedThisWeekResponse,
      ] = await Promise.all([
        supabase.from("videos").select("id", { count: "exact" }),
        supabase
          .from("videos")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase.from("users").select("id", { count: "exact" }),
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase.from("users_videos").select("is_completed"),
        supabase
          .from("users_videos")
          .select("id", { count: "exact" })
          .eq("is_completed", true),
        supabase
          .from("users_videos")
          .select("id", { count: "exact" })
          .eq("is_completed", true)
          .gte(
            "last_watched",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ]);

      if (totalVideosResponse.error) throw totalVideosResponse.error;
      if (videosThisWeekResponse.error) throw videosThisWeekResponse.error;
      if (totalUsersResponse.error) throw totalUsersResponse.error;
      if (usersThisMonthResponse.error) throw usersThisMonthResponse.error;
      if (completionRateResponse.error) throw completionRateResponse.error;
      if (videosWatchedResponse.error) throw videosWatchedResponse.error;
      if (videosWatchedThisWeekResponse.error)
        throw videosWatchedThisWeekResponse.error;

      const totalVideos = totalVideosResponse.count || 0;
      const videosThisWeek = videosThisWeekResponse.count || 0;
      const totalUsers = totalUsersResponse.count || 0;
      const usersThisMonth = usersThisMonthResponse.count || 0;
      const totalCompleted = completionRateResponse.data.filter(
        (uv) => uv.is_completed,
      ).length;
      const totalAssigned = completionRateResponse.data.length;
      const completionRate =
        totalAssigned === 0
          ? "0%"
          : `${Math.round((totalCompleted / totalAssigned) * 100)}%`;
      const videosWatched = videosWatchedResponse.count || 0;
      const videosWatchedThisWeek = videosWatchedThisWeekResponse.count || 0;

      set({
        stats: {
          totalVideos,
          videosThisWeek,
          totalUsers,
          usersThisMonth,
          completionRate,
          videosWatched,
          videosWatchedThisWeek,
        },
        initialized: true,
        loading: false,
      });

      // Subscribe to real-time changes
      const channel = supabase
        .channel("dashboard-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users_videos",
          },
          async () => {
            // Refresh data when changes occur
            const [
              totalVideosResponse,
              videosThisWeekResponse,
              totalUsersResponse,
              usersThisMonthResponse,
              completionRateResponse,
              videosWatchedResponse,
              videosWatchedThisWeekResponse,
            ] = await Promise.all([
              supabase.from("videos").select("id", { count: "exact" }),
              supabase
                .from("videos")
                .select("id", { count: "exact" })
                .gte(
                  "created_at",
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                ),
              supabase.from("users").select("id", { count: "exact" }),
              supabase
                .from("users")
                .select("id", { count: "exact" })
                .gte(
                  "created_at",
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                ),
              supabase.from("users_videos").select("is_completed"),
              supabase
                .from("users_videos")
                .select("id", { count: "exact" })
                .eq("is_completed", true),
              supabase
                .from("users_videos")
                .select("id", { count: "exact" })
                .eq("is_completed", true)
                .gte(
                  "last_watched",
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                ),
            ]);

            if (
              !totalVideosResponse.error &&
              !videosThisWeekResponse.error &&
              !totalUsersResponse.error &&
              !usersThisMonthResponse.error &&
              !completionRateResponse.error &&
              !videosWatchedResponse.error &&
              !videosWatchedThisWeekResponse.error
            ) {
              const totalVideos = totalVideosResponse.count || 0;
              const videosThisWeek = videosThisWeekResponse.count || 0;
              const totalUsers = totalUsersResponse.count || 0;
              const usersThisMonth = usersThisMonthResponse.count || 0;
              const totalCompleted = completionRateResponse.data.filter(
                (uv) => uv.is_completed,
              ).length;
              const totalAssigned = completionRateResponse.data.length;
              const completionRate =
                totalAssigned === 0
                  ? "0%"
                  : `${Math.round((totalCompleted / totalAssigned) * 100)}%`;
              const videosWatched = videosWatchedResponse.count || 0;
              const videosWatchedThisWeek =
                videosWatchedThisWeekResponse.count || 0;

              set({
                stats: {
                  totalVideos,
                  videosThisWeek,
                  totalUsers,
                  usersThisMonth,
                  completionRate,
                  videosWatched,
                  videosWatchedThisWeek,
                },
              });
            }
          },
        )
        .subscribe();

      // Store cleanup function
      const cleanup = () => {
        supabase.removeChannel(channel);
      };

      // Add cleanup to store
      set({ cleanup });
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
      const [
        totalVideosResponse,
        videosThisWeekResponse,
        totalUsersResponse,
        usersThisMonthResponse,
        completionRateResponse,
        videosWatchedResponse,
        videosWatchedThisWeekResponse,
      ] = await Promise.all([
        supabase.from("videos").select("id", { count: "exact" }),
        supabase
          .from("videos")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase.from("users").select("id", { count: "exact" }),
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .gte(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase.from("users_videos").select("is_completed"),
        supabase
          .from("users_videos")
          .select("id", { count: "exact" })
          .eq("is_completed", true),
        supabase
          .from("users_videos")
          .select("id", { count: "exact" })
          .eq("is_completed", true)
          .gte(
            "last_watched",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ]);

      if (totalVideosResponse.error) throw totalVideosResponse.error;
      if (videosThisWeekResponse.error) throw videosThisWeekResponse.error;
      if (totalUsersResponse.error) throw totalUsersResponse.error;
      if (usersThisMonthResponse.error) throw usersThisMonthResponse.error;
      if (completionRateResponse.error) throw completionRateResponse.error;
      if (videosWatchedResponse.error) throw videosWatchedResponse.error;
      if (videosWatchedThisWeekResponse.error)
        throw videosWatchedThisWeekResponse.error;

      const totalVideos = totalVideosResponse.count || 0;
      const videosThisWeek = videosThisWeekResponse.count || 0;
      const totalUsers = totalUsersResponse.count || 0;
      const usersThisMonth = usersThisMonthResponse.count || 0;
      const totalCompleted = completionRateResponse.data.filter(
        (uv) => uv.is_completed,
      ).length;
      const totalAssigned = completionRateResponse.data.length;
      const completionRate =
        totalAssigned === 0
          ? "0%"
          : `${Math.round((totalCompleted / totalAssigned) * 100)}%`;
      const videosWatched = videosWatchedResponse.count || 0;
      const videosWatchedThisWeek = videosWatchedThisWeekResponse.count || 0;

      set({
        stats: {
          totalVideos,
          videosThisWeek,
          totalUsers,
          usersThisMonth,
          completionRate,
          videosWatched,
          videosWatchedThisWeek,
        },
        loading: false,
      });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },
}));

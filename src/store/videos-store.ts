import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { VideoWithStats } from "@/types";

interface VideosStore {
  videos: VideoWithStats[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchVideos: (query: string) => VideoWithStats[];
  getVideoById: (id: string) => VideoWithStats | undefined;
}

export const useVideosStore = create<VideosStore>((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          assigned_count:users_videos(count),
          completed_count:users_videos(count).filter(is_completed.eq.true)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData = data.map((video: any) => ({
        ...video,
        num_of_assigned_users: video.assigned_count[0]?.count || 0,
        completion_rate: video.assigned_count[0]?.count
          ? ((video.completed_count[0]?.count || 0) /
              video.assigned_count[0].count) *
            100
          : 0,
      }));

      set({
        videos: transformedData as VideoWithStats[],
        initialized: true,
        loading: false,
      });

      const channel = supabase
        .channel("videos-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "videos" },
          async () => {
            const { data, error } = await supabase
              .from("videos")
              .select(
                `
                *,
                assigned_count:users_videos(count),
                completed_count:users_videos(count).filter(is_completed.eq.true)
              `
              )
              .order("created_at", { ascending: false });

            if (!error && data) {
              const transformedData = data.map((video: any) => ({
                ...video,
                num_of_assigned_users: video.assigned_count[0]?.count || 0,
                completion_rate: video.assigned_count[0]?.count
                  ? ((video.completed_count[0]?.count || 0) /
                      video.assigned_count[0].count) *
                    100
                  : 0,
              }));
              set({ videos: transformedData as VideoWithStats[] });
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
    console.log("Starting refresh, setting loading to true");
    set({ loading: true });
    try {
      console.log("Fetching data from Supabase...");

      // Add timeout to the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Query timeout after 10 seconds")),
          10000
        );
      });

      const queryPromise = supabase
        .from("videos")
        .select(
          `
          *,
          assigned_count:users_videos(count),
          completed_count:users_videos(count).filter(is_completed.eq.true)
        `
        )
        .order("created_at", { ascending: false });

      // Race between the query and timeout
      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise.then(() => ({
          data: null,
          error: new Error("Query timeout"),
        })),
      ])) as { data: any; error: any };

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      if (!data) {
        console.error("No data returned from Supabase");
        throw new Error("No data returned from query");
      }

      console.log("Data fetched successfully, transforming...");
      const transformedData = data.map((video: any) => ({
        ...video,
        num_of_assigned_users: video.assigned_count[0]?.count || 0,
        completion_rate: video.assigned_count[0]?.count
          ? ((video.completed_count[0]?.count || 0) /
              video.assigned_count[0].count) *
            100
          : 0,
      }));

      console.log("Data transformed, updating store state...");
      // Update all state at once
      const newState = {
        videos: transformedData as VideoWithStats[],
        loading: false,
        error: null,
      };
      set(newState);

      // Log the state after update using get()
      console.log("Store state after update:", {
        videosCount: get().videos.length,
        loading: get().loading,
        error: get().error,
      });
    } catch (err) {
      console.error("Refresh failed:", err);
      const errorState = {
        error: err as Error,
        loading: false,
      };
      set(errorState);

      // Log the state after error update
      console.log("Store state after error:", {
        loading: get().loading,
        error: get().error,
      });
    }
  },

  searchVideos: (query: string) => {
    const { videos } = get();
    return videos.filter(
      (video) =>
        (video.title?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (video.description?.toLowerCase().includes(query.toLowerCase()) ??
          false) ||
        (video.category?.toLowerCase().includes(query.toLowerCase()) ?? false)
    );
  },

  getVideoById: (id: string) => {
    const { videos } = get();
    return videos.find((video) => video.id === id);
  },
}));

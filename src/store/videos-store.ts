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

// Helper function to fetch videos with stats
async function fetchVideosWithStats() {
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

  if (error) throw error;
  if (!data) throw new Error("No data returned from query");

  return data.map((video: any) => ({
    ...video,
    num_of_assigned_users: video.assigned_count[0]?.count || 0,
    completion_rate: video.assigned_count[0]?.count
      ? ((video.completed_count[0]?.count || 0) /
          video.assigned_count[0].count) *
        100
      : 0,
  })) as VideoWithStats[];
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
      const transformedData = await fetchVideosWithStats();

      set({
        videos: transformedData,
        initialized: true,
        loading: false,
      });

      const channel = supabase
        .channel("videos-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "videos" },
          async () => {
            const transformedData = await fetchVideosWithStats();
            set({ videos: transformedData });
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
      const transformedData = await fetchVideosWithStats();
      set({
        videos: transformedData,
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

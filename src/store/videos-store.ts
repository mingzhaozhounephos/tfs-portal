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
  const { data, error } = await supabase
    .from("videos")
    .select(
      `
      *,
      assigned_count:users_videos(count),
      completed_count:users_videos(count).filter(is_completed.eq.true)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50); // Add pagination limit

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

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000; // 3 seconds

export const useVideosStore = create<VideosStore>((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh();
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
  },

  refresh: async () => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) return;
    lastRefresh = now;
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
    if (!query.trim()) return videos;
    const searchTerm = query.toLowerCase();
    return videos.filter(
      (video) =>
        video.title?.toLowerCase().includes(searchTerm) ||
        video.description?.toLowerCase().includes(searchTerm) ||
        video.category?.toLowerCase().includes(searchTerm)
    );
  },

  getVideoById: (id: string) => {
    const { videos } = get();
    return videos.find((video) => video.id === id);
  },
}));

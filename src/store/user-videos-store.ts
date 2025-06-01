import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserVideoWithVideo, UserStats } from "@/types";

interface UserVideosStore {
  userVideos: Record<string, UserVideoWithVideo[]>;
  stats: Record<string, UserStats>;
  loading: Record<string, boolean>;
  error: Record<string, Error | null>;
  initialized: Record<string, boolean>;
  cleanups: Record<string, () => void>;
  initialize: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  assignVideos: (videoId: string, userIds: string[]) => Promise<void>;
}

// Helper function to fetch user videos and stats
async function fetchUserVideosAndStats(userId: string) {
  const [videosResponse, statsResponse] = await Promise.all([
    supabase
      .from("users_videos")
      .select("*, video:videos(*)")
      .eq("user", userId),
    supabase.from("users_videos").select("is_completed").eq("user", userId),
  ]);

  if (videosResponse.error) throw videosResponse.error;
  if (statsResponse.error) throw statsResponse.error;

  const videos = videosResponse.data as UserVideoWithVideo[];
  const numAssigned = statsResponse.data.length;
  const completed = statsResponse.data.filter((uv) => uv.is_completed).length;
  const completion =
    numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

  return {
    videos,
    stats: { numAssigned, completion },
  };
}

const lastRefresh: Record<string, number> = {};
const REFRESH_THROTTLE = 3000; // 3 seconds

export const useUserVideosStore = create<UserVideosStore>((set, get) => ({
  userVideos: {},
  stats: {},
  loading: {},
  error: {},
  initialized: {},
  cleanups: {},

  initialize: async (userId: string) => {
    if (get().initialized[userId]) return;
    set((state) => ({
      initialized: { ...state.initialized, [userId]: true },
    }));
    await get().refresh(userId);

    const channel = supabase
      .channel(`user-videos-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users_videos",
          filter: `user=eq.${userId}`,
        },
        async () => {
          const { videos, stats } = await fetchUserVideosAndStats(userId);
          set((state) => ({
            userVideos: { ...state.userVideos, [userId]: videos },
            stats: { ...state.stats, [userId]: stats },
          }));
        }
      )
      .subscribe();

    set((state) => ({
      cleanups: {
        ...state.cleanups,
        [userId]: () => supabase.removeChannel(channel),
      },
    }));
  },

  refresh: async (userId: string) => {
    const now = Date.now();
    if (lastRefresh[userId] && now - lastRefresh[userId] < REFRESH_THROTTLE) {
      return;
    }
    lastRefresh[userId] = now;

    set((state) => ({
      loading: { ...state.loading, [userId]: true },
    }));

    try {
      const { videos, stats } = await fetchUserVideosAndStats(userId);
      set((state) => ({
        userVideos: { ...state.userVideos, [userId]: videos },
        stats: { ...state.stats, [userId]: stats },
        loading: { ...state.loading, [userId]: false },
        error: { ...state.error, [userId]: null },
      }));
    } catch (err) {
      set((state) => ({
        error: { ...state.error, [userId]: err as Error },
        loading: { ...state.loading, [userId]: false },
      }));
    }
  },

  assignVideos: async (videoId: string, userIds: string[]) => {
    // 1. Fetch all existing assignments for this video
    const { data: existingAssignments, error: fetchError } = await supabase
      .from("users_videos")
      .select("*")
      .eq("video", videoId);

    if (fetchError) throw fetchError;

    const now = new Date().toISOString();

    // 2. Find users to remove (were assigned, now unselected)
    const existingUserIds = new Set(existingAssignments.map((a) => a.user));
    const usersToRemove = existingAssignments.filter(
      (a) => !userIds.includes(a.user)
    );

    // 3. Find users to add (newly selected)
    const usersToAdd = userIds.filter((id) => !existingUserIds.has(id));

    // 4. Remove unselected users
    if (usersToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("users_videos")
        .delete()
        .in(
          "id",
          usersToRemove.map((v) => v.id)
        );
      if (deleteError) throw deleteError;
    }

    // 5. Add new users with assigned_date
    if (usersToAdd.length > 0) {
      const assignments = usersToAdd.map((userId) => ({
        user: userId,
        video: videoId,
        is_completed: false,
        assigned_date: now,
      }));

      const { error: insertError } = await supabase
        .from("users_videos")
        .insert(assignments);

      if (insertError) throw insertError;
    }

    // 6. Refresh data for all affected users
    await Promise.all(userIds.map((userId) => get().refresh(userId)));
  },
}));

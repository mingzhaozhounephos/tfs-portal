import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserWithRole, VideoWithStats } from "@/types";

interface UserVideoAssignment {
  user: UserWithRole;
  video: VideoWithStats;
  is_completed: boolean;
  assigned_date: string;
}

interface UsersVideosStore {
  assignments: Record<string, UserVideoAssignment[]>; // key is videoId
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  getAssignmentsForVideo: (videoId: string) => UserVideoAssignment[];
  assignVideos: (videoId: string, userIds: string[]) => Promise<void>;
}

// Helper function to fetch video assignments with user and video details
async function fetchVideoAssignments() {
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
      user:users(
        *,
        user_roles!inner(role)
      ),
      video:videos(
        *,
        users_videos(
          id,
          is_completed
        )
      )
    `
    )
    .order("assigned_date", { ascending: false });
  const { data, error } = (await Promise.race([
    queryPromise,
    timeoutPromise.then(() => ({
      data: null,
      error: new Error("Query timeout"),
    })),
  ])) as { data: any; error: any };
  if (error) throw error;
  if (!data) throw new Error("No data returned from query");
  const assignments = data.map((assignment: any) => {
    const videoAssignments = assignment.video.users_videos || [];
    const totalAssigned = videoAssignments.length;
    const completedCount = videoAssignments.filter(
      (a: any) => a.is_completed
    ).length;
    return {
      user: {
        ...assignment.user,
        role: assignment.user.user_roles?.[0]?.role || null,
      } as UserWithRole,
      video: {
        ...assignment.video,
        num_of_assigned_users: totalAssigned,
        completion_rate:
          totalAssigned > 0 ? (completedCount / totalAssigned) * 100 : 0,
      } as VideoWithStats,
      is_completed: assignment.is_completed,
      assigned_date: assignment.assigned_date,
    };
  }) as UserVideoAssignment[];
  return assignments.reduce((acc, assignment) => {
    const videoId = assignment.video.id;
    if (!acc[videoId]) acc[videoId] = [];
    acc[videoId].push(assignment);
    return acc;
  }, {} as Record<string, UserVideoAssignment[]>);
}

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000;

export const useUsersVideosStore = create<UsersVideosStore>((set, get) => ({
  assignments: {},
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh();
    // Subscribe to real-time changes
    const channel = supabase
      .channel("users-videos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users_videos" },
        async () => {
          const assignments = await fetchVideoAssignments();
          set({ assignments });
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
      const assignments = await fetchVideoAssignments();
      set({ assignments, loading: false, error: null });
    } catch (err) {
      set({ error: err as Error, loading: false });
    }
  },

  getAssignmentsForVideo: (videoId: string) => {
    return get().assignments[videoId] || [];
  },

  assignVideos: async (videoId: string, userIds: string[]) => {
    const currentAssignments = get().assignments[videoId] || [];
    const currentUserIds = currentAssignments.map((a) => a.user.id);
    const usersToAdd = userIds.filter((id) => !currentUserIds.includes(id));
    const usersToRemove = currentUserIds.filter((id) => !userIds.includes(id));
    try {
      if (usersToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("users_videos")
          .delete()
          .eq("video", videoId)
          .in("user", usersToRemove);
        if (removeError) throw removeError;
      }
      if (usersToAdd.length > 0) {
        const { error: addError } = await supabase.from("users_videos").insert(
          usersToAdd.map((userId) => ({
            user: userId,
            video: videoId,
            is_completed: false,
          }))
        );
        if (addError) throw addError;
      }
      await get().refresh();
    } catch (err) {
      throw err;
    }
  },
}));

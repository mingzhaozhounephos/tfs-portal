import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UserVideoWithVideo, UserStats } from '@/types';

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

export const useUserVideosStore = create<UserVideosStore>((set, get) => ({
  userVideos: {},
  stats: {},
  loading: {},
  error: {},
  initialized: {},
  cleanups: {},

  initialize: async (userId: string) => {
    // If already initialized for this user, don't fetch again
    if (get().initialized[userId]) return;

    set(state => ({
      loading: { ...state.loading, [userId]: true }
    }));

    try {
      // Fetch initial data with join
      const [videosResponse, statsResponse] = await Promise.all([
        supabase
          .from('users_videos')
          .select('*, video:videos(*)')
          .eq('user', userId),
        supabase
          .from('users_videos')
          .select('is_completed')
          .eq('user', userId)
      ]);

      if (videosResponse.error) throw videosResponse.error;
      if (statsResponse.error) throw statsResponse.error;

      const videos = videosResponse.data as UserVideoWithVideo[];
      const numAssigned = statsResponse.data.length;
      const completed = statsResponse.data.filter(uv => uv.is_completed).length;
      const completion = numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

      set(state => ({
        userVideos: { ...state.userVideos, [userId]: videos },
        stats: { ...state.stats, [userId]: { numAssigned, completion } },
        initialized: { ...state.initialized, [userId]: true },
        loading: { ...state.loading, [userId]: false }
      }));

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`user-videos-${userId}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'users_videos',
            filter: `user=eq.${userId}`
          },
          async () => {
            // Refresh data when changes occur
            const [videosResponse, statsResponse] = await Promise.all([
              supabase
                .from('users_videos')
                .select('*, video:videos(*)')
                .eq('user', userId),
              supabase
                .from('users_videos')
                .select('is_completed')
                .eq('user', userId)
            ]);

            if (!videosResponse.error && !statsResponse.error) {
              const videos = videosResponse.data as UserVideoWithVideo[];
              const numAssigned = statsResponse.data.length;
              const completed = statsResponse.data.filter(uv => uv.is_completed).length;
              const completion = numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

              set(state => ({
                userVideos: { ...state.userVideos, [userId]: videos },
                stats: { ...state.stats, [userId]: { numAssigned, completion } }
              }));
            }
          }
        )
        .subscribe();

      // Store cleanup function in state
      set(state => ({
        cleanups: { ...state.cleanups, [userId]: () => supabase.removeChannel(channel) }
      }));
    } catch (err) {
      set(state => ({
        error: { ...state.error, [userId]: err as Error },
        loading: { ...state.loading, [userId]: false }
      }));
    }
  },

  refresh: async (userId: string) => {
    set(state => ({
      loading: { ...state.loading, [userId]: true }
    }));

    try {
      const [videosResponse, statsResponse] = await Promise.all([
        supabase
          .from('users_videos')
          .select('*, video:videos(*)')
          .eq('user', userId),
        supabase
          .from('users_videos')
          .select('is_completed')
          .eq('user', userId)
      ]);

      if (videosResponse.error) throw videosResponse.error;
      if (statsResponse.error) throw statsResponse.error;

      const videos = videosResponse.data as UserVideoWithVideo[];
      const numAssigned = statsResponse.data.length;
      const completed = statsResponse.data.filter(uv => uv.is_completed).length;
      const completion = numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

      set(state => ({
        userVideos: { ...state.userVideos, [userId]: videos },
        stats: { ...state.stats, [userId]: { numAssigned, completion } },
        loading: { ...state.loading, [userId]: false }
      }));
    } catch (err) {
      set(state => ({
        error: { ...state.error, [userId]: err as Error },
        loading: { ...state.loading, [userId]: false }
      }));
    }
  },

  assignVideos: async (videoId: string, userIds: string[]) => {
    // 1. Fetch all existing assignments for this video
    const { data: existingAssignments, error: fetchError } = await supabase
      .from('users_videos')
      .select('*')
      .eq('video', videoId);

    if (fetchError) throw fetchError;

    const now = new Date().toISOString();

    // 2. Find users to remove (were assigned, now unselected)
    const existingUserIds = new Set(existingAssignments.map(a => a.user));
    const usersToRemove = existingAssignments.filter(a => !userIds.includes(a.user));

    // 3. Find users to add (newly selected)
    const usersToAdd = userIds.filter(id => !existingUserIds.has(id));

    // 4. Remove unselected users
    if (usersToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('users_videos')
        .delete()
        .in('id', usersToRemove.map(v => v.id));
      if (deleteError) throw deleteError;
    }

    // 5. Add new users with assigned_date
    if (usersToAdd.length > 0) {
      const assignments = usersToAdd.map(userId => ({
        user: userId,
        video: videoId,
        is_completed: false,
        assigned_date: now,
      }));
      const { error: insertError } = await supabase
        .from('users_videos')
        .insert(assignments);
      if (insertError) throw insertError;
    }

    // 6. For users that remain assigned, update if needed (preserve assigned_date)
    const usersToUpdate = existingAssignments.filter(a => userIds.includes(a.user));
    for (const assignment of usersToUpdate) {
      // You can update other fields here if needed, but keep assigned_date unchanged
      // Example: await supabase.from('users_videos').update({ ... }).eq('id', assignment.id);
    }
  }
})); 
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UserVideo, UserStats } from '@/types';

interface UserVideosStore {
  userVideos: Record<string, UserVideo[]>;
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
      // Fetch initial data
      const [videosResponse, statsResponse] = await Promise.all([
        supabase
          .from('users_videos')
          .select('*')
          .eq('user', userId),
        supabase
          .from('users_videos')
          .select('is_completed')
          .eq('user', userId)
      ]);

      if (videosResponse.error) throw videosResponse.error;
      if (statsResponse.error) throw statsResponse.error;

      const videos = videosResponse.data as UserVideo[];
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
                .select('*')
                .eq('user', userId),
              supabase
                .from('users_videos')
                .select('is_completed')
                .eq('user', userId)
            ]);

            if (!videosResponse.error && !statsResponse.error) {
              const videos = videosResponse.data as UserVideo[];
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
          .select('*')
          .eq('user', userId),
        supabase
          .from('users_videos')
          .select('is_completed')
          .eq('user', userId)
      ]);

      if (videosResponse.error) throw videosResponse.error;
      if (statsResponse.error) throw statsResponse.error;

      const videos = videosResponse.data as UserVideo[];
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
    const assignments = userIds.map(userId => ({
      user: userId,
      video: videoId
    }));

    const { error } = await supabase
      .from('users_videos')
      .insert(assignments);

    if (error) throw error;

    // Refresh data for all affected users
    await Promise.all(userIds.map(userId => get().refresh(userId)));
  }
})); 
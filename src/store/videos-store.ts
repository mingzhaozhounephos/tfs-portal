import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Video } from '@/types';

interface VideosStore {
  videos: Video[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchVideos: (query: string) => Video[];
  getVideoById: (id: string) => Video | undefined;
}

export const useVideosStore = create<VideosStore>((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Fetch initial data
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        videos: data as Video[],
        initialized: true,
        loading: false 
      });

      // Subscribe to real-time changes
      const channel = supabase
        .channel('videos-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'videos' },
          async () => {
            // Refresh data when changes occur
            const { data, error } = await supabase
              .from('videos')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && data) {
              set({ videos: data as Video[] });
            }
          }
        )
        .subscribe();

      // Cleanup subscription on store reset
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      set({ 
        error: err as Error,
        loading: false 
      });
    }
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        videos: data as Video[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err as Error,
        loading: false 
      });
    }
  },

  searchVideos: (query: string) => {
    const { videos } = get();
    return videos.filter(
      video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase()) ||
        video.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  getVideoById: (id: string) => {
    const { videos } = get();
    return videos.find(video => video.id === id);
  }
})); 
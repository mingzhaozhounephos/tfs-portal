import { supabase } from './supabase';
import { User, Video, UserVideo, UserStats } from '@/types';

export const api = {
  users: {
    async getAll() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as User;
    },

    async create(user: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    }
  },

  videos: {
    async getAll() {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Video[];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Video;
    },

    async create(video: Partial<Video>) {
      const { data, error } = await supabase
        .from('videos')
        .insert([video])
        .select()
        .single();
      
      if (error) throw error;
      return data as Video;
    }
  },

  userVideos: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('users_videos')
        .select('*')
        .eq('user', userId);
      
      if (error) throw error;
      return data as UserVideo[];
    },

    async getByVideoId(videoId: string) {
      const { data, error } = await supabase
        .from('users_videos')
        .select('*')
        .eq('video', videoId);
      
      if (error) throw error;
      return data as UserVideo[];
    },

    async assign(videoId: string, userIds: string[]) {
      const assignments = userIds.map(userId => ({
        user: userId,
        video: videoId
      }));

      const { data, error } = await supabase
        .from('users_videos')
        .insert(assignments)
        .select();
      
      if (error) throw error;
      return data as UserVideo[];
    },

    async getUserStats(userId: string): Promise<UserStats> {
      const { data, error } = await supabase
        .from('users_videos')
        .select('is_completed')
        .eq('user', userId);
      
      if (error) throw error;
      
      const numAssigned = data.length;
      const completed = data.filter(uv => uv.is_completed).length;
      const completion = numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);
      
      return { numAssigned, completion };
    }
  }
}; 
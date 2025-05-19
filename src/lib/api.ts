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

    async assign(userId: string, videoIds: string[]) {
      // First, get existing assignments for this user
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('users_videos')
        .select('video')
        .eq('user', userId);
      
      if (fetchError) throw fetchError;

      // Filter out videos that are already assigned
      const existingVideoIds = new Set(existingAssignments.map(a => a.video));
      const newVideoIds = videoIds.filter(id => !existingVideoIds.has(id));

      if (newVideoIds.length === 0) {
        return existingAssignments as UserVideo[];
      }

      // Create new assignments only for videos that aren't already assigned
      const assignments = newVideoIds.map(videoId => ({
        user: userId,
        video: videoId,
        is_completed: false
      }));

      const { data, error } = await supabase
        .from('users_videos')
        .insert(assignments)
        .select();
      
      if (error) throw error;

      // Return both existing and new assignments
      return [...existingAssignments, ...data] as UserVideo[];
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
import { Database } from './supabase';

// Base types from Supabase
export type User = Database['public']['Tables']['users']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type UserVideo = Database['public']['Tables']['users_videos']['Row'];

// Extended types for joined data
export interface UserVideoWithVideo extends Omit<UserVideo, 'video'> {
  video: Video;
}

// Stats interface remains unchanged as it's not directly related to database schema
export interface UserStats {
  numAssigned: number;
  completion: number;
}

export interface DashboardStats {
  totalVideos: number;
  videosThisWeek: number;
  totalUsers: number;
  usersThisMonth: number;
  completionRate: string;
  videosWatched: number;
  videosWatchedThisWeek: number;
} 
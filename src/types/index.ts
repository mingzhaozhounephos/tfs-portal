import { Database } from "./supabase";

// Base types from Supabase
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type UserVideo = Database["public"]["Tables"]["users_videos"]["Row"];

// Extended types for joined data
export interface UserWithRole extends User {
  role: string | null;
}

export interface UserWithDetails extends User {
  role_info: UserRole | null;
}

export interface UserVideoWithVideo extends Omit<UserVideo, "video"> {
  video: Video;
}

// Extended Video type with aggregated fields
export interface VideoWithStats extends Video {
  // Only add the new aggregated fields that don't exist in the base Video type
  num_of_assigned_users: number;
  completion_rate: number;
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

export interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: string | Date;
  duration: string;
  youtube_url?: string;
  assigned_date?: string | Date;
  last_watched?: string | Date;
  renewal_due?: string;
  is_completed?: boolean;
  modified_date?: string;
  last_action?: string;
  is_annual_renewal?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'driver';
  created_at?: string;
}

export interface Video {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  created_at?: string;
  admin_user_id?: string;
}

export interface UserVideo {
  id: string;
  user: string;
  video: string;
  is_completed: boolean;
  last_watched?: string;
}

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
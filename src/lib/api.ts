import { supabase } from "./supabase";
import { User, Video, UserVideo, UserStats } from "@/types";

export const api = {
  users: {
    async getAll() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as User[];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as User;
    },

    async create(user: Partial<User>) {
      const { data, error } = await supabase
        .from("users")
        .insert([user])
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
  },

  videos: {
    async getAll() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Video[];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Video;
    },

    async create(video: Partial<Video>) {
      const { data, error } = await supabase
        .from("videos")
        .insert([video])
        .select()
        .single();

      if (error) throw error;
      return data as Video;
    },
  },

  userVideos: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from("users_videos")
        .select("*")
        .eq("user", userId);

      if (error) throw error;
      return data as UserVideo[];
    },

    async getByVideoId(videoId: string) {
      const { data, error } = await supabase
        .from("users_videos")
        .select("*")
        .eq("video", videoId);

      if (error) throw error;
      return data as UserVideo[];
    },

    async assign(userId: string, videoIds: string[]) {
      // First, get existing assignments for this user
      const { data: existingAssignments, error: fetchError } = await supabase
        .from("users_videos")
        .select("*")
        .eq("user", userId);

      if (fetchError) throw fetchError;

      // Get the current date in ISO format
      const currentDate = new Date().toISOString();

      // Find videos to remove (exist in database but not in new selection)
      const existingVideoIds = new Set(existingAssignments.map((a) => a.video));
      const videosToRemove = existingAssignments.filter(
        (a) => !videoIds.includes(a.video),
      );

      // Find videos to add (exist in new selection but not in database)
      const newVideoIds = videoIds.filter((id) => !existingVideoIds.has(id));

      // Remove unselected videos
      if (videosToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("users_videos")
          .delete()
          .in(
            "id",
            videosToRemove.map((v) => v.id),
          );

        if (deleteError) throw deleteError;
      }

      // Add new videos with assigned_date
      if (newVideoIds.length > 0) {
        const assignments = newVideoIds.map((videoId) => ({
          user: userId,
          video: videoId,
          is_completed: false,
          assigned_date: currentDate,
          last_watched: currentDate,
        }));

        const { error: insertError } = await supabase
          .from("users_videos")
          .insert(assignments);

        if (insertError) throw insertError;
      }

      // Return updated assignments
      const { data: updatedAssignments, error: finalError } = await supabase
        .from("users_videos")
        .select("*")
        .eq("user", userId);

      if (finalError) throw finalError;
      return updatedAssignments as UserVideo[];
    },

    async getUserStats(userId: string): Promise<UserStats> {
      const { data, error } = await supabase
        .from("users_videos")
        .select("is_completed")
        .eq("user", userId);

      if (error) throw error;

      const numAssigned = data.length;
      const completed = data.filter((uv) => uv.is_completed).length;
      const completion =
        numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

      return { numAssigned, completion };
    },
  },
};

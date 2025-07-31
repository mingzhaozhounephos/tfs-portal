import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface TrainingVideoStore {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  updateVideoProgress: (userId: string, videoId: string) => Promise<void>;
}

export const useTrainingVideoStore = create<TrainingVideoStore>((set, get) => ({
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
  },

  refresh: async () => {
    // No refresh needed as this store only handles updates
  },

  updateVideoProgress: async (userId: string, videoId: string) => {
    try {
      // Find the users_videos record for this user and video, join videos table
      const { data: userVideo, error } = await supabase
        .from("users_videos")
        .select("*, video:videos(*)")
        .eq("user", userId)
        .eq("video", videoId)
        .single();

      if (error) {
        throw error;
      }

      const now = new Date().toISOString();
      // If annual renewal is due, reset assigned_date and completion
      const isAnnualRenewal =
        userVideo.video?.is_annual_renewal &&
        userVideo.assigned_date &&
        new Date().getTime() - new Date(userVideo.assigned_date).getTime() >
          365 * 24 * 60 * 60 * 1000;

      if (isAnnualRenewal) {
        await supabase
          .from("users_videos")
          .update({
            last_watched: now,
            modified_date: now,
            assigned_date: now,
            last_action: "watched",
            is_completed: false,
            completed_date: null,
          })
          .eq("id", userVideo.id);
      } else {
        await supabase
          .from("users_videos")
          .update({
            last_watched: now,
            modified_date: now,
            last_action: userVideo.is_completed ? "completed" : "watched",
          })
          .eq("id", userVideo.id);
      }
    } catch (err) {
      console.error("Error updating video progress:", err);
      throw err;
    }
  },
}));

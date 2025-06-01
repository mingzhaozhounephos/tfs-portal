import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useVideoCompletion() {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markVideoAsCompleted = async (user: User, videoId: string) => {
    if (!user) return false;

    setIsCompleting(true);
    setError(null);

    try {
      // First, find the user_video record
      const { data: userVideo, error: findError } = await supabase
        .from("users_videos")
        .select("id")
        .eq("user", user.id)
        .eq("video", videoId)
        .single();

      if (findError) throw findError;
      if (!userVideo) throw new Error("Video assignment not found");

      // Then update it to completed
      const { error: updateError } = await supabase
        .from("users_videos")
        .update({ is_completed: true, last_action: "completed" })
        .eq("id", userVideo.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to mark video as completed")
      );
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    markVideoAsCompleted,
    isCompleting,
    error,
  };
}

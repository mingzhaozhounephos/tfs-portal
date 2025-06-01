import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useVideoActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteVideo = async (videoId: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete video")
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteVideo,
    isDeleting,
    error,
  };
}

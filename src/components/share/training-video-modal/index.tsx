import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVideoCompletion } from "@/hooks/use-video-completion";

// Extend the Window interface for YT and onYouTubeIframeAPIReady
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface TrainingVideoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  youtubeId: string;
  videoId: string; // Supabase record id
}

export function TrainingVideoModal({
  open,
  onClose,
  title,
  youtubeId,
  videoId,
}: TrainingVideoModalProps) {
  const playerRef = useRef<any>(null);
  const { user } = useAuth();
  const { markVideoAsCompleted, isCompleting, error } = useVideoCompletion();
  const [videoEnded, setVideoEnded] = useState(false);

  const handleManualCompletion = async () => {
    if (user) {
      const success = await markVideoAsCompleted(user, videoId);
      if (success) {
        onClose();
      }
    }
  };

  // Load the YouTube IFrame API and setup the player
  useEffect(() => {
    if (!open || !youtubeId) return;

    // Load the YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // This will be called by the YouTube API when it's ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        height: "390",
        width: "640",
        videoId: youtubeId,
        playerVars: { autoplay: 1 },
        events: {
          onStateChange: async (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setVideoEnded(true);
            }
          },
        },
      });
    };

    // If the API is already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    // Cleanup on close/unmount
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      window.onYouTubeIframeAPIReady = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, youtubeId, videoId, user]);

  if (!open || !youtubeId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="font-bold text-lg mb-2">{title}</div>
        <div className="aspect-video w-full">
          <div id="player" />
        </div>
        {error && (
          <div className="text-red-600 mt-2 text-center">{error.message}</div>
        )}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleManualCompletion}
            disabled={isCompleting || !videoEnded}
            className="px-4 py-2 bg-[#EA384C] text-white rounded-lg hover:bg-[#EC4659] font-medium disabled:opacity-50"
          >
            {isCompleting ? "Marking as Completed..." : "Mark as Completed"}
          </button>
        </div>
      </div>
    </div>
  );
}

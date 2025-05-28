import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { AssignVideoModal } from "@/components/manage-users/assign-video-modal";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format-date";
import { TrainingVideoModal } from "@/components/training-videos/training-video-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminVideoCardProps {
  video: {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    created_at: string | Date;
    duration: string;
    youtube_url?: string;
  };
  onEdit?: () => void;
  showEdit?: boolean;
  onAssignToUsers?: () => void;
}

function getYouTubeId(url?: string) {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

function getYouTubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function AdminVideoCard({
  video,
  onEdit,
  showEdit = false,
  onAssignToUsers,
}: AdminVideoCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
  });
  const { user } = useAuth();
  const youtubeId = getYouTubeId(video.youtube_url);
  const thumbnailUrl = youtubeId
    ? getYouTubeThumbnail(youtubeId)
    : video.image || "";

  // Add a refreshStats function
  const refreshStats = useCallback(async () => {
    try {
      const { data: assignedData, error: assignedError } = await supabase
        .from("users_videos")
        .select("*", { count: "exact" })
        .eq("video", video.id);
      if (assignedError) throw assignedError;
      const { data: completedData, error: completedError } = await supabase
        .from("users_videos")
        .select("*", { count: "exact" })
        .eq("video", video.id)
        .eq("is_completed", true);
      if (completedError) throw completedError;
      const assignedCount = assignedData?.length || 0;
      const completedCount = completedData?.length || 0;
      setStats({
        assigned: assignedCount,
        completed: assignedCount
          ? Math.round((completedCount / assignedCount) * 100)
          : 0,
      });
    } catch (error) {
      console.error("Error refreshing video stats:", error);
    }
  }, [video.id]);

  useEffect(() => {
    refreshStats();
    // ...existing subscription code...
  }, [video.id, refreshStats]);

  async function handleOpenModal() {
    if (!user || !video.id) return;

    try {
      // First check if the users_videos record exists
      const {
        data: existingRecord,
        error,
        status,
      } = await supabase
        .from("users_videos")
        .select("*")
        .eq("user", user.id)
        .eq("video", video.id)
        .single();

      // Only log real errors, not 'no record found'
      if (error && status !== 406) {
        console.error("Error checking users_videos record:", error);
        return;
      }

      // Only update if the record exists
      if (existingRecord) {
        const { error: updateError } = await supabase
          .from("users_videos")
          .update({
            last_watched: new Date().toISOString(),
            modified_date: new Date().toISOString(),
            last_action: existingRecord.is_completed ? "completed" : "watched",
            assigned_date: existingRecord.assigned_date,
          })
          .eq("user", user.id)
          .eq("video", video.id);

        if (updateError) {
          console.error("Error updating users_videos:", updateError);
          return;
        }
      }
    } catch (error) {
      console.error("Error in handleOpenModal:", error);
      return;
    }

    setShowModal(true);
  }

  return (
    <div className="group bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative border border-transparent hover:border-[#EA384C] hover:shadow-lg transition-all duration-200">
      {/* Pencil icon for edit */}
      {showEdit && (
        <div className="absolute top-3 right-3 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FEEBED] hover:bg-[#FFD6DB] transition"
                aria-label="Open menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="4" r="1.5" fill="#333" />
                  <circle cx="10" cy="10" r="1.5" fill="#333" />
                  <circle cx="10" cy="16" r="1.5" fill="#333" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-0">
              <DropdownMenuItem
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md group transition-colors group-hover:bg-[#FEEBED]"
                style={{ color: "#222" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pencil w-4 h-4 group-hover:text-black text-black transition-colors"
                >
                  <path d="M18 2a2.828 2.828 0 1 1 4 4L7 21l-4 1 1-4Z" />
                  <path d="M16 5 19 8" />
                </svg>
                <span className="group-hover:text-black text-black transition-colors">
                  Edit
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-b-md group transition-colors group-hover:bg-[#FEEBED]"
                style={{ color: "#EA384C" }}
              >
                <Trash2 className="w-4 h-4 group-hover:text-black text-[#EA384C] transition-colors" />
                <span className="group-hover:text-black text-[#EA384C] transition-colors">
                  Delete
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="font-bold pr-6">{video.title}</div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`inline-block text-xs font-semibold rounded-full px-3 py-0.5
            ${
              video.category?.toLowerCase() === "office"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : video.category?.toLowerCase() === "truck"
                ? "bg-green-100 text-green-700 border border-green-200"
                : video.category?.toLowerCase() === "van"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          style={{ minWidth: "fit-content" }}
        >
          {video.category}
        </span>
      </div>
      <div
        className="text-xs text-gray-600 mb-2 line-clamp-2"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {video.description}
      </div>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer"
        onClick={() => youtubeId && handleOpenModal()}
      >
        <Image
          src={thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {youtubeId && (
          <>
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 z-10" />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
              <span className="rounded-full bg-white/60 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-[#EA384C]" fill="none" />
              </span>
            </span>
          </>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={16} className="text-gray-400" />
          {formatDate(video.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} className="text-gray-400" />
          {video.duration}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users size={16} className="text-gray-400" />
          {stats.assigned} assigned
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={16} className="text-gray-400" />
          {stats.completed}% completed
        </span>
      </div>

      <button
        className="mt-auto bg-[#EA384C] text-white rounded-lg py-2 font-medium hover:bg-[#EC4659] transition"
        onClick={() => setAssignModalOpen(true)}
      >
        Assign to Users
      </button>
      <AssignVideoModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        videoId={video.id}
        videoTitle={video.title}
        assignedCount={stats.assigned}
        onAfterAssign={refreshStats}
      />
      {/* YouTube Modal */}
      <TrainingVideoModal
        open={showModal && !!youtubeId}
        onClose={() => setShowModal(false)}
        title={video.title}
        youtubeId={youtubeId}
        videoId={video.id}
      />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
            <div className="mb-4 text-center">
              <Trash2 className="w-10 h-10 text-[#EA384C] mx-auto mb-2" />
              <div className="text-lg font-semibold mb-2">Delete Video</div>
              <div className="text-gray-600">
                Are you sure that you want to delete{" "}
                <span className="font-bold">{video.title}</span>?
              </div>
              {stats.assigned > 0 && (
                <div className="text-red-600 mt-2">
                  This video is assigned to {stats.assigned} user
                  {stats.assigned > 1 ? "s" : ""}.
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full justify-center mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#EA384C] text-white font-medium hover:bg-[#EC4659] transition"
                onClick={async () => {
                  setIsDeleting(true);
                  // Delete users_videos first
                  await supabase
                    .from("users_videos")
                    .delete()
                    .eq("video", video.id);
                  // Delete the video
                  await supabase.from("videos").delete().eq("id", video.id);
                  setIsDeleting(false);
                  setShowDeleteModal(false);
                  // Optionally, trigger a refresh or callback here
                  window.location.reload();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

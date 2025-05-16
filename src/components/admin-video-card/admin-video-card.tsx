import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckCircle, PlayCircle } from "lucide-react";
import { AssignVideoModal } from "@/components/manage-users/assign-video-modal";
import { supabase } from "@/lib/supabase";
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

interface AdminVideoCardProps {
  video: {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    created_at: string | Date;
    duration: string;
    num_users_assigned: number;
    num_users_completed: number;
    youtube_url?: string;
  };
  onEdit?: () => void;
  showEdit?: boolean;
  onAssignToUsers?: () => void;
}

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export function AdminVideoCard({ video, onEdit, showEdit = false, onAssignToUsers }: AdminVideoCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0
  });
  const { user } = useAuth();
  const youtubeId = getYouTubeId(video.youtube_url);
  const thumbnailUrl = youtubeId ? getYouTubeThumbnail(youtubeId) : video.image || "/rick-astley.jpg";

  useEffect(() => {
    async function fetchVideoStats() {
      try {
        // Get total assigned users
        const { data: assignedData, error: assignedError } = await supabase
          .from('users_videos')
          .select('*', { count: 'exact' })
          .eq('video', video.id);

        if (assignedError) throw assignedError;

        // Get completed users
        const { data: completedData, error: completedError } = await supabase
          .from('users_videos')
          .select('*', { count: 'exact' })
          .eq('video', video.id)
          .eq('is_completed', true);

        if (completedError) throw completedError;

        const assignedCount = assignedData?.length || 0;
        const completedCount = completedData?.length || 0;

        setStats({
          assigned: assignedCount,
          completed: assignedCount ? Math.round((completedCount / assignedCount) * 100) : 0
        });
      } catch (error) {
        console.error('Error fetching video stats:', error);
      }
    }

    // Initial fetch
    fetchVideoStats();

    // Subscribe to changes
    const channel = supabase.channel(`video-${video.id}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users_videos',
          filter: `video=eq.${video.id}`
        },
        (payload) => {
          console.log('Change detected:', payload);
          fetchVideoStats();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [video.id]);

  async function handleOpenModal() {
    if (user && video.id) {
      await supabase
        .from('users_videos')
        .update({ last_watched: new Date().toISOString() })
        .eq('user', user.id)
        .eq('video', video.id);
    }
    setShowModal(true);
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative">
      {/* Pencil icon for edit */}
      {showEdit && (
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
          onClick={onEdit}
          aria-label="Edit video"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <path d="M14.7 3.29a1 1 0 0 1 1.41 1.42l-9.08 9.08a1 1 0 0 0-.26.46l-1 3a1 1 0 0 0 1.26 1.26l3-1a1 1 0 0 0 .46-.26l9.08-9.08a1 1 0 0 0-1.42-1.42l-9.08 9.08a1 1 0 0 1-.46.26l-3 1a1 1 0 0 1-1.26-1.26l1-3a1 1 0 0 1 .26-.46l9.08-9.08z" fill="currentColor"/>
          </svg>
        </button>
      )}
      <div className="font-bold">{video.title}</div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={
            `inline-block text-xs font-semibold rounded-full px-3 py-0.5
            ${
              video.category?.toLowerCase() === "office"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : video.category?.toLowerCase() === "truck"
                ? "bg-green-100 text-green-700 border border-green-200"
                : video.category?.toLowerCase() === "van"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`
          }
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
      <div className="relative aspect-video w-full overflow-hidden rounded-lg group cursor-pointer" onClick={() => youtubeId && handleOpenModal()}>
        <Image
          src={thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {youtubeId && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/60 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-black/70" fill="none" />
            </span>
          </span>
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
    className="mt-2 w-full border rounded py-1 text-sm font-medium"
    style={{ borderColor: 'var(--border-default)' }}
    onClick={() => setAssignModalOpen(true)}
  >
    Assign to Users
  </button>
  <AssignVideoModal
    isOpen={assignModalOpen}
    onClose={() => setAssignModalOpen(false)}
    videoId={video.id}
    videoTitle={video.title}
  />

      {/* YouTube Modal */}
      {showModal && youtubeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="font-bold text-lg mb-2">{video.title}</div>
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";

interface AdminVideoCardProps {
  video: {
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

function getYouTubeThumbnail(url: string) {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : "";
}

export function AdminVideoCard({ video, onEdit, showEdit = false, onAssignToUsers }: AdminVideoCardProps) {
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
      <div className="relative aspect-video rounded overflow-hidden mb-2">
        <img
          src={getYouTubeThumbnail(video.youtube_url)}
          alt={video.title}
          className="object-cover w-full h-full"
        />
        <button className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white/80 rounded-full p-2">
            <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><polygon points="13,11 23,16 13,21" fill="#fff"/></svg>
          </span>
        </button>
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
          {video.num_users_assigned} assigned
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={16} className="text-gray-400" />
          {video.num_users_completed}% completed
        </span>
      </div>
      <button
        className="mt-2 w-full border rounded py-1 text-sm font-medium"
        onClick={onAssignToUsers}
      >
        Assign to Users
      </button>
    </div>
  );
}
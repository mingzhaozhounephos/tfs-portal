import React from "react";

interface AdminVideoCardProps {
  video: {
    title: string;
    tag: string;
    description: string;
    image: string;
    date: string;
    duration: string;
    assigned: number;
    completed: string;
  };
  onEdit?: () => void;
  showEdit?: boolean;
  onAssignToUsers?: () => void;
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
      <span className={`inline-block text-xs rounded px-2 py-0.5 mb-1 ${
        video.tag === "van"
          ? "bg-blue-100 text-blue-700"
          : video.tag === "truck"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}>
        {video.tag}
      </span>
      <div className="text-xs text-gray-600 mb-2">{video.description}</div>
      <div className="relative aspect-video rounded overflow-hidden mb-2">
        <img src={video.image} alt={video.title} className="object-cover w-full h-full" />
        <button className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white/80 rounded-full p-2">
            <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><polygon points="13,11 23,16 13,21" fill="#fff"/></svg>
          </span>
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{video.date}</span>
        <span>{video.duration}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{video.assigned} assigned</span>
        <span>{video.completed} completed</span>
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
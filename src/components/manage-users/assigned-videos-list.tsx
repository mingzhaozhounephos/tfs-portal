'use client';

import { useState, useMemo } from "react";
import { useUserVideos } from "@/hooks/use-user-videos";
import { Calendar, Clock, Users, CheckCircle, PlayCircle } from "lucide-react";
import Image from 'next/image';

interface AssignedVideosListProps {
  userId: string;
  filter?: string;
}

export function AssignedVideosList({ userId, filter = "all" }: AssignedVideosListProps) {
  const { videos, loading } = useUserVideos(userId);

  const filteredVideos = useMemo(() => {
    if (filter === "pending") return videos.filter(v => !v.is_completed);
    if (filter === "completed") return videos.filter(v => v.is_completed);
    if (filter === "renewal") return videos.filter(v => typeof v.video === 'object' && v.video.renewal_required);
    if (["van", "truck", "office"].includes(filter)) return videos.filter(v => typeof v.video === 'object' && v.video.category === filter);
    return videos;
  }, [videos, filter]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading videos...</div>;
  if (!filteredVideos.length) return <div className="p-8 text-center text-gray-400">No videos found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {filteredVideos.map((userVideo, i) => {
        const video = typeof userVideo.video === 'object' ? userVideo.video : undefined;
        return (
          <div key={userVideo.id || i} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border" style={{ borderColor: 'var(--border-default)' }}>
            <div className="font-bold text-base mb-1">{video?.title || '-'}</div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold mb-1 ${video?.category === 'van' ? 'bg-blue-100 text-blue-700' : video?.category === 'truck' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{video?.category || '-'}</span>
            <div className="text-xs text-gray-500 mb-2 line-clamp-2">{video?.description || '-'}</div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg group cursor-pointer">
              <Image
                src={video?.image || "/rick-astley.jpg"}
                alt={video?.title || 'Video'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-white/60 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-black/70" fill="none" />
                </span>
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {video?.created_at ? new Date(video.created_at).toLocaleDateString() : "-"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                {video?.duration || "-"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} className="text-gray-400" />
                - assigned
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={14} className="text-gray-400" />
                {userVideo.is_completed ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 
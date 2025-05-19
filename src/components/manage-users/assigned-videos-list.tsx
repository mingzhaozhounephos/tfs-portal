'use client';

import { useState, useMemo } from "react";
import { useUserVideos } from "@/hooks/use-user-videos";
import { AdminVideoCard } from "@/components/admin-video-card/admin-video-card";

interface AssignedVideosListProps {
  userId: string;
  filter?: string;
}

export function AssignedVideosList({ userId, filter = "all" }: AssignedVideosListProps) {
  const { videos, loading } = useUserVideos(userId);

  const filteredVideos = useMemo(() => {
    // First filter by user ID
    const userVideos = videos.filter(v => v.user === userId);
    
    // Then apply additional filters
    if (filter === "pending") return userVideos.filter(v => !v.is_completed);
    if (filter === "completed") return userVideos.filter(v => v.is_completed);
    if (filter === "renewal") return userVideos.filter(v => typeof v.video === 'object' && v.video.renewal_required);
    if (["van", "truck", "office"].includes(filter)) return userVideos.filter(v => typeof v.video === 'object' && v.video.category === filter);
    return userVideos; // 'all' case
  }, [videos, filter, userId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading videos...</div>;
  if (!filteredVideos.length) return <div className="p-8 text-center text-gray-400">No videos found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {filteredVideos.map((userVideo, i) => {
        const video = typeof userVideo.video === 'object' ? userVideo.video : undefined;
        if (!video) return null;
        
        return (
          <AdminVideoCard
            key={userVideo.id || i}
            video={{
              id: video.id,
              title: video.title || '-',
              category: video.category || '-',
              description: video.description || '-',
              image: video.image || "/rick-astley.jpg",
              created_at: video.created_at || new Date(),
              duration: video.duration || '-',
              num_users_assigned: 0,
              num_users_completed: 0,
              youtube_url: video.youtube_url
            }}
            showEdit={false}
          />
        );
      })}
    </div>
  );
} 
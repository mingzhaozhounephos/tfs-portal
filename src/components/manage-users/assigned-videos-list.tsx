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
  if (!filteredVideos.length) {
    let title = '';
    let subtitle = '';
    switch (filter) {
      case 'all':
        title = 'No Videos';
        subtitle = "This user hasn't been assigned to any videos.";
        break;
      case 'pending':
        title = 'No Pending Videos';
        subtitle = "This user doesn't have any pending videos.";
        break;
      case 'completed':
        title = 'No Completed Videos';
        subtitle = "This user hasn't completed any videos yet.";
        break;
      case 'renewal':
        title = 'No Renewal Videos';
        subtitle = "This user doesn't have any videos to renewal.";
        break;
      case 'van':
        title = 'No Van Videos';
        subtitle = "This user doesn't have any  videos for van.";
        break;
      case 'truck':
        title = 'No Truck Videos';
        subtitle = "This user doesn't have any  videos for truck.";
        break;
      case 'office':
        title = 'No Office Videos';
        subtitle = "This user doesn't have any  videos for office.";
        break;
      default:
        title = 'No Videos';
        subtitle = "This user hasn't been assigned to any videos.";
    }
    return (
      <div className="w-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-16 px-4">
        <div className="flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 text-gray-400"><path d="M24 8L6 40h36L24 8z" stroke="currentColor" strokeWidth="3" fill="none"/><circle cx="24" cy="32" r="2.5" fill="currentColor"/><rect x="22.75" y="18" width="2.5" height="10" rx="1.25" fill="currentColor"/></svg>
          <div className="font-bold text-xl text-gray-900 mb-2">{title}</div>
          <div className="text-gray-500 text-base">{subtitle}</div>
        </div>
      </div>
    );
  }

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
              image: video.image || "",
              created_at: video.created_at || new Date(),
              duration: video.duration || '-',
              youtube_url: video.youtube_url
            }}
            showEdit={false}
          />
        );
      })}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { User } from '@/types';
import { AssignVideosModal } from './assign-videos-modal';
import { useUserVideos } from '@/hooks/use-user-videos';
import { api } from '@/lib/api';

interface AssignVideoButtonProps {
  user: User;
}

export function AssignVideoButton({ user }: AssignVideoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { videos, refresh } = useUserVideos(user.id);

  const handleSave = async (selectedVideoIds: string[]) => {
    await api.userVideos.assign(user.id, selectedVideoIds);
    await refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
      >
        <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2"/><path d="M9 5v8M5 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        Assign Video
      </button>

      <AssignVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        assignedVideoIds={videos.map(v => typeof v.video === 'string' ? v.video : v.video.id)}
        onSave={handleSave}
      />
    </>
  );
} 
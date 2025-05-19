'use client';

import { useState } from 'react';
import { User } from '@/types';
import { AssignedVideosToggle } from './assigned-videos-toggle';
import { AssignedVideosList } from './assigned-videos-list';

interface UserDetailsClientProps {
  user: User;
}

export function UserDetailsClient({ user }: UserDetailsClientProps) {
  const [filter, setFilter] = useState("all");

  return (
    <>
      <AssignedVideosToggle userId={user.id} onFilterChange={setFilter} filter={filter} />
      <AssignedVideosList userId={user.id} filter={filter} />
    </>
  );
} 
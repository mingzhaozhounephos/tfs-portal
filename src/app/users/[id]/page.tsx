'use client';

import { notFound } from 'next/navigation';
import { SideMenu } from '@/components/side-menu/side-menu';
import { api } from '@/lib/api';
import { UserDetailsCards } from '@/components/manage-users/user-details-cards';
import { AssignedVideosToggle } from '@/components/manage-users/assigned-videos-toggle';
import { AssignedVideosList } from '@/components/manage-users/assigned-videos-list';
import { AssignVideoButton } from '@/components/manage-users/assign-video-button';
import Link from 'next/link';
import { User } from '@/types';
import { UserDetailsClient } from '@/components/manage-users/user-details-client';
import { useUserRole } from '@/hooks/use-user-role';
import { useEffect, useState } from 'react';

interface UserDetailsPageProps {
  params: { id: string };
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const { role } = useUserRole();

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.users.getById(params.id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, [params.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7F9FA] min-h-screen h-screen">
      <SideMenu role={role || 'driver'} active="manage-users" />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="mb-6">
          <Link href="/manage-users" className="inline-flex items-center gap-2 px-4 py-2 rounded border bg-white hover:bg-gray-50 font-medium text-sm" style={{ borderColor: 'var(--border-default)' }}>
            <span>&larr;</span> Back to Users
          </Link>
        </div>
        <UserDetailsCards user={user} />
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-xl font-bold">Assigned Videos</h2>
          <AssignVideoButton user={user} />
        </div>
        <UserDetailsClient user={user} />
      </main>
    </div>
  );
} 
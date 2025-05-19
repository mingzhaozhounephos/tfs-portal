import { notFound } from 'next/navigation';
import { SideMenu } from '@/components/side-menu/side-menu';
import { api } from '@/lib/api';
import { UserDetailsCards } from '@/components/manage-users/user-details-cards';
import { AssignedVideosToggle } from '@/components/manage-users/assigned-videos-toggle';
import { AssignedVideosList } from '@/components/manage-users/assigned-videos-list';
import Link from 'next/link';

interface UserDetailsPageProps {
  params: { id: string };
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const user = await api.users.getById(params.id);
  if (!user) return notFound();

  // The SideMenu expects a role prop; fallback to 'driver' if missing
  return (
    <div className="flex bg-[#F7F9FA] min-h-screen h-screen">
      <SideMenu role={user.role || 'driver'} active="manage-users" />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="mb-6">
          <Link href="/manage-users" className="inline-flex items-center gap-2 px-4 py-2 rounded border bg-white hover:bg-gray-50 font-medium text-sm" style={{ borderColor: 'var(--border-default)' }}>
            <span>&larr;</span> Back to Users
          </Link>
        </div>
        <UserDetailsCards user={user} />
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-xl font-bold">Assigned Videos</h2>
          {/* Assign Video button can open a modal or trigger logic as needed */}
          <button className="bg-black text-white rounded px-4 py-2 text-sm font-medium">Assign Video</button>
        </div>
        <AssignedVideosToggle userId={user.id} />
        <AssignedVideosList userId={user.id} />
      </main>
    </div>
  );
} 
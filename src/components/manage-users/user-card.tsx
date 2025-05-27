import { Users, Calendar, Video, CheckCircle, Mail } from "lucide-react";
import { User } from "@/types";
import { useUserVideos } from "@/hooks/use-user-videos";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface UserCardProps {
  user: User;
  onAssignVideo: (userId: string) => void;
}

export function UserCard({ user, onAssignVideo }: UserCardProps) {
  const { stats, loading } = useUserVideos(user.id);
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border relative" style={{ borderColor: 'var(--border-default)' }}>
      {/* Inactive badge */}
      {user.is_active === false && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded z-20">inactive</span>
      )}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Users size={28} />
        </div>
        <div>
          <div className="font-bold text-lg">{user.full_name || user.email}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Mail size={14} className="text-gray-400" />
            {user.email}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-700 mb-2 gap-2">
        <div className="flex flex-col gap-2 flex-1">
          <span className="inline-block font-semibold border rounded-full px-3 py-0.5 bg-white text-black text-xs text-center w-fit mb-1" style={{ borderColor: 'var(--border-default)' }}>
            {user.role}
          </span>
          <span className="flex items-center gap-1">
            <Video size={14} className="text-gray-400" />
            {loading ? "-" : `${stats.numAssigned} videos assigned`}
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-1 items-start">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            {user.created_at ? `Joined ${format(new Date(user.created_at), 'MMM d, yyyy')}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-gray-400" />
            {loading ? "-" : `${stats.completion}% completed`}
          </span>
        </div>
      </div>
      
      <button
        onClick={() => router.push(`/users/${user.id}`)}
        className="w-full border rounded py-1 text-sm font-medium"
        style={{ borderColor: 'var(--border-default)' }}
      >
        View Details
      </button>
    </div>
  );
} 
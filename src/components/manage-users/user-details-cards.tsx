'use client';

import { Users, Calendar, Video, CheckCircle, Mail } from "lucide-react";
import { User } from "@/types";
import { useUserVideos } from "@/hooks/use-user-videos";
import { format } from 'date-fns';

interface UserDetailsCardsProps {
  user: User;
}

export function UserDetailsCards({ user }: UserDetailsCardsProps) {
  const { stats, loading } = useUserVideos(user.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border" style={{ borderColor: 'var(--border-default)' }}>
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
            <span className="inline-block font-semibold border rounded-full px-3 py-0.5 bg-white text-black text-xs text-center w-fit mt-1" style={{ borderColor: 'var(--border-default)' }}>
              {user.role}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <span className="block">Joined {user.created_at ? format(new Date(user.created_at), 'MMM yyyy') : "-"}</span>
          <span className="block mt-1">Training Progress</span>
          <div className="w-full bg-gray-100 rounded h-2 mt-1">
            <div className="bg-black h-2 rounded" style={{ width: loading ? '0%' : `${stats.completion}%` }} />
          </div>
          <span className="block mt-1">{loading ? "-" : `${stats.completion}% Complete`} <span className="text-gray-400">/ {stats.numAssigned} videos</span></span>
        </div>
      </div>
      {/* Assigned Videos Card */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Video size={20} className="text-gray-400" />
          <span className="font-semibold text-sm">Assigned Videos</span>
        </div>
        <div className="text-2xl font-bold">{loading ? '-' : stats.numAssigned}</div>
        <div className="text-xs text-gray-500">{loading ? '' : `${stats.numAssigned - Math.round(stats.completion * stats.numAssigned / 100)} pending completion`}</div>
      </div>
      {/* Completion Rate Card */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={20} className="text-gray-400" />
          <span className="font-semibold text-sm">Completion Rate</span>
        </div>
        <div className="text-2xl font-bold">{loading ? '-' : `${stats.completion}%`}</div>
        <div className="w-full bg-gray-100 rounded h-2 mt-2">
          <div className="bg-black h-2 rounded" style={{ width: loading ? '0%' : `${stats.completion}%` }} />
        </div>
      </div>
      {/* Renewal Required Card */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={20} className="text-gray-400" />
          <span className="font-semibold text-sm">Renewal Required</span>
        </div>
        <div className="text-2xl font-bold">5</div>
        <div className="text-xs text-gray-500">Videos needing annual renewal</div>
      </div>
    </div>
  );
} 
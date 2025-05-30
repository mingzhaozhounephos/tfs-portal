"use client";

import { Users, Video, CheckCircle, RefreshCw } from "lucide-react";
import { User, UserWithRole } from "@/types";
import { useUserVideos } from "@/hooks/use-user-videos";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserDetailsCardsProps {
  user: User;
}

export function UserDetailsCards({ user }: UserDetailsCardsProps) {
  const { stats, loading, videos } = useUserVideos(user.id);
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user", user.id)
        .single();

      if (userRole) {
        setUserWithRole({
          ...user,
          role: userRole.role,
        });
      }
    }
    fetchUserRole();
  }, [user]);

  // Calculate completed videos count
  const completedVideos = videos.filter((v) => v.is_completed).length;

  if (!userWithRole) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-9 gap-4 mb-8 grid-flow-col md:auto-cols-fr">
      {/* Profile Card - compact, split top */}
      <div
        className="bg-white rounded-2xl shadow p-6 flex flex-col border min-h-[320px] col-span-1 md:col-span-3"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-row items-center mb-4 gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Users size={40} className="text-gray-300" />
            </div>
          </div>
          {/* Name, Email, Badge */}
          <div className="flex flex-col justify-center">
            <div className="font-bold text-2xl text-black leading-tight mb-1">
              {userWithRole.full_name || userWithRole.email}
            </div>
            <div className="text-gray-500 text-base mb-2 break-all">
              {userWithRole.email}
            </div>
            <span
              className="inline-block border border-gray-300 rounded-full px-3 py-0.5 bg-white text-black text-xs font-bold w-fit"
              style={{ borderColor: "var(--border-default)" }}
            >
              {userWithRole.role}
            </span>
          </div>
        </div>
        <div className="text-gray-500 text-sm mb-1">Joined</div>
        <div className="text-black text-xl font-semibold mb-4">
          {userWithRole.created_at
            ? format(new Date(userWithRole.created_at), "MMM yyyy")
            : "-"}
        </div>
        <div className="text-gray-500 text-sm mb-1">Training Progress</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-black font-normal text-sm">
            {loading ? "-" : `${stats.completion}% Complete`}
          </span>
          <span className="text-gray-500 font-normal text-sm">
            {loading ? "-" : `${completedVideos}/${stats.numAssigned} videos`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div
            className="h-2 rounded-full bg-[#EA384C]"
            style={{ width: loading ? "0%" : `${stats.completion}%` }}
          />
        </div>
      </div>
      {/* Assigned Videos Card */}
      <div
        className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border min-h-[180px] col-span-1 md:col-span-2"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-semibold">Assigned Videos</div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
            <Video size={22} className="text-[#EA384C]" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">
          {loading ? "-" : stats.numAssigned}
        </div>
        <div className="text-gray-500 text-base">
          {loading
            ? ""
            : `${
                stats.numAssigned -
                Math.round((stats.completion * stats.numAssigned) / 100)
              } pending completion`}
        </div>
      </div>
      {/* Completion Rate Card */}
      <div
        className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border min-h-[180px] col-span-1 md:col-span-2"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-semibold">Completion Rate</div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
            <CheckCircle size={22} className="text-[#EA384C]" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-2">
          {loading ? "-" : `${stats.completion}%`}
        </div>
        <div className="w-full bg-gray-100 rounded h-2 mt-2">
          <div
            className="bg-[#EA384C] h-2 rounded"
            style={{ width: loading ? "0%" : `${stats.completion}%` }}
          />
        </div>
      </div>
      {/* Renewal Required Card */}
      <div
        className="bg-white rounded-xl shadow p-6 flex flex-col justify-center border min-h-[180px] col-span-1 md:col-span-2"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-semibold">Renewal Required</div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
            <RefreshCw size={22} className="text-[#EA384C]" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">5</div>
        <div className="text-gray-500 text-base">
          Videos needing annual renewal
        </div>
      </div>
    </div>
  );
}

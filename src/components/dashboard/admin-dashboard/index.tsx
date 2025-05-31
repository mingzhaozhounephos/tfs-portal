import { JSX, useState, useEffect } from "react";
import { SideMenu } from "@/components/side-menu";
import { ManageVideos } from "@/components/manage-videos/manage-videos-main";
import { ManageUsers } from "@/components/manage-users/manage-users-main";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Users, Activity, Play } from "lucide-react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { supabase } from "@/lib/supabase";

export function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const { user } = useAuth();
  const [adminName, setAdminName] = useState<string>("Administrator");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const { stats, loading } = useAdminDashboard();

  useEffect(() => {
    async function fetchAdminInfo() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setAdminName(data.full_name?.trim() ? data.full_name : "Administrator");
        setAdminEmail(data.email || "");
      }
    }
    fetchAdminInfo();
  }, [user]);

  return (
    <div className="flex bg-white min-h-screen h-screen">
      <SideMenu role="admin" active={active} onNavigate={setActive} />
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        {active === "manage-videos" ? (
          <ManageVideos />
        ) : active === "manage-users" ? (
          <ManageUsers />
        ) : (
          <>
            <div className="flex flex-col gap-2 items-center mb-6 w-full">
              <div className="flex items-start justify-between w-full">
                <img
                  src="/images/Logo.jpg"
                  alt="TFS Express Logistics"
                  className="h-8 w-auto mb-2"
                />
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>
                <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                  Welcome, {adminName} ({adminEmail})
                </div>
              </div>
            </div>
            {/* Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative">
              <Widget
                title="Total Videos"
                value={String(stats.totalVideos)}
                sub={`+${stats.videosThisWeek} videos added this week`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Bell className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
              <Widget
                title="Total Users"
                value={String(stats.totalUsers)}
                sub={`+${stats.usersThisMonth} users added this month`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Users className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
              <Widget
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                sub=""
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Activity className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
                progress={stats.completionRate}
              />
              <Widget
                title="Videos Watched"
                value={String(stats.totalVideosWatched)}
                sub={`+${stats.videosWatchedThisWeek} videos watched this week`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Play className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface WidgetProps {
  title: string;
  value: string;
  sub: string;
  icon: JSX.Element;
  progress?: number;
}

function Widget({ title, value, sub, icon, progress }: WidgetProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{title}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
      {typeof progress === "number" && (
        <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-[#EA384C] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

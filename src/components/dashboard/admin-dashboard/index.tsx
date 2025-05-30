import { JSX, useState, useEffect } from "react";
import { SideMenu } from "@/components/side-menu";
import { ManageVideos } from "@/components/manage-videos/manage-videos-main";
import { ManageUsers } from "@/components/manage-users/manage-users-main";
import { supabase } from "@/lib/supabase";
import { Bell, Users, Activity, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);
  const [videosThisWeek, setVideosThisWeek] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersThisMonth, setUsersThisMonth] = useState(0);
  const [completionRate, setCompletionRate] = useState("0%");
  const [videosWatched, setVideosWatched] = useState(0);
  const [videosWatchedThisWeek, setVideosWatchedThisWeek] = useState(0);
  const { user } = useAuth();
  const [adminName, setAdminName] = useState<string>("Administrator");
  const [adminEmail, setAdminEmail] = useState<string>("");

  function isThisWeek(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return date >= startOfWeek && date < endOfWeek;
  }

  function isThisMonth(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

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

  useEffect(() => {
    let channel: any;
    async function fetchVideos() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setTotalVideos(data.length);
          setVideosThisWeek(
            data.filter((v) => v.created_at && isThisWeek(v.created_at)).length
          );
        }

        // Real-time subscription
        channel = supabase
          .channel("videos-admin-dashboard")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "videos",
              filter: `admin_user_id=eq.${session.user.id}`,
            },
            (payload) => {
              supabase
                .from("videos")
                .select("*")
                .eq("admin_user_id", session.user.id)
                .order("created_at", { ascending: false })
                .then(({ data, error }) => {
                  if (!error && data) {
                    setTotalVideos(data.length);
                    setVideosThisWeek(
                      data.filter(
                        (v) => v.created_at && isThisWeek(v.created_at)
                      ).length
                    );
                  }
                });
            }
          )
          .subscribe();
      }
      setLoading(false);
    }
    if (active === "dashboard") {
      fetchVideos();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [active]);

  useEffect(() => {
    let channel: any;
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setTotalUsers(data.length);
        setUsersThisMonth(
          data.filter((u) => u.created_at && isThisMonth(u.created_at)).length
        );
      }
      // Real-time subscription
      channel = supabase
        .channel("users-admin-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users" },
          (payload) => {
            supabase
              .from("users")
              .select("*")
              .order("created_at", { ascending: false })
              .then(({ data, error }) => {
                if (!error && data) {
                  setTotalUsers(data.length);
                  setUsersThisMonth(
                    data.filter(
                      (u) => u.created_at && isThisMonth(u.created_at)
                    ).length
                  );
                }
              });
          }
        )
        .subscribe();
    }
    if (active === "dashboard") {
      fetchUsers();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [active]);

  useEffect(() => {
    let channel: any;
    async function fetchCompletionRate() {
      const { data: allData, error: allError } = await supabase
        .from("users_videos")
        .select("id, is_completed");
      if (!allError && allData) {
        const total = allData.length;
        const completed = allData.filter((uv: any) => uv.is_completed).length;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
        setCompletionRate(`${rate}%`);
      }
      // Real-time subscription
      channel = supabase
        .channel("users-videos-admin-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users_videos" },
          (payload) => {
            supabase
              .from("users_videos")
              .select("id, is_completed")
              .then(({ data, error }) => {
                if (!error && data) {
                  const total = data.length;
                  const completed = data.filter(
                    (uv: any) => uv.is_completed
                  ).length;
                  const rate =
                    total === 0 ? 0 : Math.round((completed / total) * 100);
                  setCompletionRate(`${rate}%`);
                }
              });
          }
        )
        .subscribe();
    }
    if (active === "dashboard") {
      fetchCompletionRate();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [active]);

  useEffect(() => {
    let channel: any;
    async function fetchVideosWatched() {
      const { data, error } = await supabase
        .from("users_videos")
        .select("last_watched");
      if (!error && data) {
        const watched = data.filter((uv: any) => uv.last_watched).length;
        const watchedThisWeek = data.filter(
          (uv: any) => uv.last_watched && isThisWeek(uv.last_watched)
        ).length;
        setVideosWatched(watched);
        setVideosWatchedThisWeek(watchedThisWeek);
      }
      // Real-time subscription
      channel = supabase
        .channel("users-videos-watched-admin-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users_videos" },
          (payload) => {
            supabase
              .from("users_videos")
              .select("last_watched")
              .then(({ data, error }) => {
                if (!error && data) {
                  const watched = data.filter(
                    (uv: any) => uv.last_watched
                  ).length;
                  const watchedThisWeek = data.filter(
                    (uv: any) => uv.last_watched && isThisWeek(uv.last_watched)
                  ).length;
                  setVideosWatched(watched);
                  setVideosWatchedThisWeek(watchedThisWeek);
                }
              });
          }
        )
        .subscribe();
    }
    if (active === "dashboard") {
      fetchVideosWatched();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [active]);

  return (
    <div className="flex bg-white min-h-screen h-screen">
      <SideMenu role="admin" active={active} onNavigate={setActive} />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Widget
                title="Total Videos"
                value={String(totalVideos)}
                sub={`+${videosThisWeek} videos added this week`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Bell className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
              <Widget
                title="Total Users"
                value={String(totalUsers)}
                sub={`+${usersThisMonth} users added this month`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Users className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
              <Widget
                title="Completion Rate"
                value={completionRate}
                sub=""
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Activity className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
                progress={parseInt(completionRate)}
              />
              <Widget
                title="Videos Watched"
                value={String(videosWatched)}
                sub={`+${videosWatchedThisWeek} videos watched this week`}
                icon={
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                    <Play className="w-5 h-5 text-[#EA384C]" />
                  </div>
                }
              />
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

import { JSX, useState, useEffect } from "react";
import { SideMenu } from "@/components/side-menu/side-menu";
import { ManageVideos } from "@/components/manage-videos/manage-videos";
import { AdminVideoCard } from "@/components/admin-video-card/admin-video-card";
import { ManageUsers } from "@/components/manage-users/manage-users";
import { supabase } from "@/lib/supabase";
import { Bell, Users, Activity, Play } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { UserCard } from "../manage-users/user-card";

const videoData = [
  {
    title: "Workplace Harassment Prevention",
    tag: "office",
    description: "Understand what constitutes workplace harassment and how to prevent it. This video covers company policies, reporting procedures, and creating a respectful...",
    image: "/rick-astley.jpg",
    date: "Dec 8, 2023",
    duration: "28:15",
    assigned: 35,
    completed: "95%",
  },
  {
    title: "Data Security Best Practices",
    tag: "office",
    description: "Protect sensitive company and customer data with these security best practices. Learn about password management, phishing prevention, and secure data...",
    image: "/rick-astley.jpg",
    date: "Nov 12, 2023",
    duration: "22:30",
    assigned: 30,
    completed: "85%",
  },
  {
    title: "Office Safety Procedures",
    tag: "office",
    description: "Learn essential safety procedures for the office environment. This video covers ergonomics, fire safety, and emergency protocols to ensure a safe workplace.",
    image: "/rick-astley.jpg",
    date: "Oct 5, 2023",
    duration: "16:45",
    assigned: 25,
    completed: "90%",
  },
];

const userData = [
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    role: "driver",
    joined: "Joined May 2023",
    assigned: 3,
    completed: "33%",
  },
  {
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    role: "driver",
    joined: "Joined Apr 2023",
    assigned: 4,
    completed: "25%",
  },
  {
    name: "Michael Chen",
    email: "driver@driver",
    role: "driver",
    joined: "Joined Mar 2023",
    assigned: 5,
    completed: "80%",
  },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<"videos" | "users">("videos");
  const [active, setActive] = useState("dashboard");
  const [videos, setVideos] = useState<any[]>([]);
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
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setVideos(data);
          setTotalVideos(data.length);
          setVideosThisWeek(data.filter(v => v.created_at && isThisWeek(v.created_at)).length);
        }

        // Real-time subscription
        channel = supabase
          .channel('videos-admin-dashboard')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'videos', filter: `admin_user_id=eq.${session.user.id}` },
            payload => {
              supabase
                .from("videos")
                .select("*")
                .eq("admin_user_id", session.user.id)
                .order("created_at", { ascending: false })
                .then(({ data, error }) => {
                  if (!error && data) {
                    setVideos(data);
                    setTotalVideos(data.length);
                    setVideosThisWeek(data.filter(v => v.created_at && isThisWeek(v.created_at)).length);
                  }
                });
            }
          )
          .subscribe();
      }
      setLoading(false);
    }
    if (active === "dashboard" && tab === "videos") {
      fetchVideos();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [active, tab]);

  useEffect(() => {
    let channel: any;
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setTotalUsers(data.length);
        setUsersThisMonth(data.filter(u => u.created_at && isThisMonth(u.created_at)).length);
      }
      // Real-time subscription
      channel = supabase
        .channel('users-admin-dashboard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          payload => {
            supabase
              .from("users")
              .select("*")
              .order("created_at", { ascending: false })
              .then(({ data, error }) => {
                if (!error && data) {
                  setTotalUsers(data.length);
                  setUsersThisMonth(data.filter(u => u.created_at && isThisMonth(u.created_at)).length);
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
        .channel('users-videos-admin-dashboard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users_videos' },
          payload => {
            supabase
              .from("users_videos")
              .select("id, is_completed")
              .then(({ data, error }) => {
                if (!error && data) {
                  const total = data.length;
                  const completed = data.filter((uv: any) => uv.is_completed).length;
                  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
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
        const watchedThisWeek = data.filter((uv: any) => uv.last_watched && isThisWeek(uv.last_watched)).length;
        setVideosWatched(watched);
        setVideosWatchedThisWeek(watchedThisWeek);
      }
      // Real-time subscription
      channel = supabase
        .channel('users-videos-watched-admin-dashboard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users_videos' },
          payload => {
            supabase
              .from("users_videos")
              .select("last_watched")
              .then(({ data, error }) => {
                if (!error && data) {
                  const watched = data.filter((uv: any) => uv.last_watched).length;
                  const watchedThisWeek = data.filter((uv: any) => uv.last_watched && isThisWeek(uv.last_watched)).length;
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
    <div className="flex bg-[#f6fbf9] min-h-screen h-screen">
      <SideMenu role="admin" active={active} onNavigate={setActive} />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {active === "manage-videos" ? (
          <ManageVideos />
        ) : active === "manage-users" ? (
          <ManageUsers />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="text-sm text-gray-600">
                Welcome, {adminName} ({adminEmail})
              </div>
            </div>
            {/* Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Widget title="Total Videos" value={String(totalVideos)} sub={`+${videosThisWeek} videos added this week`} icon={<Bell className="w-5 h-5 text-gray-400" />} />
              <Widget title="Total Users" value={String(totalUsers)} sub={`+${usersThisMonth} users added this month`} icon={<Users className="w-5 h-5 text-gray-400" />} />
              <Widget title="Completion Rate" value={completionRate} sub="" icon={<Activity className="w-5 h-5 text-gray-400" />} progress={parseInt(completionRate)} />
              <Widget title="Videos Watched" value={String(videosWatched)} sub={`+${videosWatchedThisWeek} videos watched this week`} icon={<Play className="w-5 h-5 text-gray-400" />} />
            </div>
            {/* Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded ${tab === "videos" ? "bg-black text-white" : "bg-white border"}`}
                onClick={() => setTab("videos")}
              >
                Recent Videos
              </button>
              <button
                className={`px-4 py-2 rounded ${tab === "users" ? "bg-black text-white" : "bg-white border"}`}
                onClick={() => setTab("users")}
              >
                Recent Users
              </button>
            </div>
            {/* Content */}
            {tab === "videos" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videos.map((video, i) => (
                  <AdminVideoCard
                    key={i}
                    video={video}
                    showEdit={true}
                    onAssignToUsers={() => {/* handle assign to users */}}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.map((user, i) => (
                  <UserCard key={i} user={user} />
                ))}
              </div>
            )}
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
      {typeof progress === 'number' && (
        <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-green-200 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
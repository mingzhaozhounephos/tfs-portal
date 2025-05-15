import { Users, Calendar, Video, CheckCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserCardProps {
  user: {
    id?: string;
    name?: string;
    email: string;
    role: string;
    created_at?: string;
  };
}

export function UserCard({ user }: UserCardProps) {
  const [numAssigned, setNumAssigned] = useState<number>(0);
  const [completion, setCompletion] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("users_videos")
        .select("is_completed")
        .eq("user", user.id);
      if (!error && data) {
        setNumAssigned(data.length);
        const completed = data.filter((uv: any) => uv.is_completed).length;
        setCompletion(data.length === 0 ? 0 : Math.round((completed / data.length) * 100));
      }
      setLoading(false);
    }
    fetchStats();
  }, [user.id]);

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border" style={{ borderColor: 'var(--border-default)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Users size={28} />
        </div>
        <div>
          <div className="font-bold text-lg">{user.name || user.email}</div>
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
            {loading ? "-" : `${numAssigned} videos assigned`}
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-1 items-start">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            {user.created_at ? `Joined ${new Date(user.created_at).toLocaleString("en-US", { month: "short", year: "numeric" })}` : ""}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-gray-400" />
            {loading ? "-" : `${completion}% completed`}
          </span>
        </div>
      </div>
      <button className="w-full border rounded py-1 text-sm font-medium" style={{ borderColor: 'var(--border-default)' }}>View Details</button>
    </div>
  );
} 
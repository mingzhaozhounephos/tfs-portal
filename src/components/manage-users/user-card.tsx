import { Users, Calendar, ListChecks } from "lucide-react";

interface UserCardProps {
  user: {
    id?: string;
    name?: string;
    email: string;
    role: string;
    created_at?: string;
    num_videos_assigned?: number;
    completion_rate?: number;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Users size={28} />
        </div>
        <div>
          <div className="font-bold text-lg">{user.name || user.email}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`inline-block text-xs font-semibold rounded-full px-3 py-0.5
            ${
              user.role === "admin"
                ? "bg-gray-200 text-gray-800 border border-gray-300"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
        >
          {user.role}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={14} className="text-gray-400" />
          Joined {user.created_at ? new Date(user.created_at).toLocaleString("en-US", { month: "short", year: "numeric" }) : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <ListChecks size={14} className="text-gray-400" />
          {user.num_videos_assigned ?? 0} videos assigned
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} className="text-gray-400" />
          {user.completion_rate ?? 0}% completed
        </span>
      </div>
      <button className="w-full border rounded py-1 text-sm font-medium">View Details</button>
    </div>
  );
} 
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Calendar, ListChecks, PlusCircle } from "lucide-react";
import { UserFormModal } from "./user-form-modal";

const roles = {
  admin: "admin",
  driver: "driver",
};

export function ManageUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      // Fetch users from Supabase
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Optionally, refresh users after adding a new user
  function handleUserAdded() {
    setLoading(true);
    supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setUsers(data);
        setLoading(false);
      });
  }

  return (
    <div className="flex-1 p-8 bg-[#f6fbf9] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-900"
          onClick={() => setModalOpen(true)}
        >
          <PlusCircle size={20} />
          Add User
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredUsers.map((user, i) => (
            <div
              key={user.id || i}
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
          ))}
        </div>
      )}
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUserAdded}
      />
    </div>
  );
} 
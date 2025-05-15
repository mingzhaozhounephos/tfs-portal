import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Calendar, ListChecks, PlusCircle } from "lucide-react";
import { UserFormModal } from "./user-form-modal";
import { UserCard } from "./user-card";

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
            <UserCard key={user.id || i} user={user} />
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
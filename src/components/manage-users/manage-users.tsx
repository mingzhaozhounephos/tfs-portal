import { useState } from "react";
import { Users, Calendar, ListChecks, PlusCircle } from "lucide-react";
import { UserFormModal } from "./user-form-modal";
import { UserCard } from "./user-card";
import { AssignVideoModal } from "./assign-video-modal";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/types";

export function ManageUsers() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const { users, loading, error, searchUsers, refresh } = useUsers();

  const filteredUsers = searchUsers(search);

  const handleAssignVideo = (userId: string) => {
    setSelectedVideoId(userId);
    setAssignModalOpen(true);
  };

  return (
    <div className="flex-1 p-8 bg-[#F7F9FA] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-900"
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
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error.message}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onAssignVideo={handleAssignVideo}
            />
          ))}
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refresh}
      />

      <AssignVideoModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        videoId={selectedVideoId}
      />
    </div>
  );
} 
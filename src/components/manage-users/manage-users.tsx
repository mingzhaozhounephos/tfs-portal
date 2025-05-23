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
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const { users, loading, error, searchUsers, refresh } = useUsers();

  const filteredUsers = searchUsers(search);

  const handleAssignVideo = (userId: string) => {
    setSelectedVideoId(userId);
    setSelectedVideoTitle("Selected Video"); // This should be replaced with actual video title
    setAssignModalOpen(true);
  };

  return (
    <div className="flex-1 p-8 bg-[#F7F9FA] min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img src="/images/Logo.jpg" alt="TFS Express Logistics" className="h-8 w-auto mb-2" />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
        >
          <PlusCircle size={20} />
          Add User
        </button>
      </div>
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
            <svg className="lucide lucide-search w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
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
              onAssignVideo={(userId) => handleAssignVideo(userId)}
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
        videoId={selectedVideoId || ""}
        videoTitle={selectedVideoTitle}
        assignedCount={0}
      />
    </div>
  );
} 
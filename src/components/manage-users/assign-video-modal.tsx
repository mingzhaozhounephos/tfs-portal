import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";


interface AssignVideoModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string; // uuid of the video
  videoTitle: string;
}

export function AssignVideoModal({ open, onClose, videoId, videoTitle }: AssignVideoModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [userVideoMap, setUserVideoMap] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Fetch users and user-video assignments
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    async function fetchData() {
      // Get all users
      const { data: usersData } = await supabase.from("users").select("*");
      // Get all user-video assignments for this video
      const { data: userVideosData } = await supabase
        .from("users_videos")
        .select("user, video")
        .eq("video", videoId);

      // Map userId to assigned status
      const assignedMap: Record<string, boolean> = {};
      userVideosData?.forEach((uv: any) => {
        assignedMap[uv.user] = true;
      });

      setUsers(usersData || []);
      setUserVideoMap(assignedMap);
      setIsLoading(false);
    }
    fetchData();
  }, [open, videoId]);

  // Filter users by search
  const filteredUsers = users.filter(
    u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Selection state
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Pre-check already assigned users
    if (open) {
      const initial: Record<string, boolean> = {};
      Object.keys(userVideoMap).forEach(userId => {
        if (userVideoMap[userId]) initial[userId] = true;
      });
      setSelected(initial);
    }
  }, [userVideoMap, open]);

  // Select all logic
  const allFilteredIds = filteredUsers.map(u => u.id);
  const allSelected = allFilteredIds.every(id => selected[id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  function handleSelectAll() {
    const newSelected: Record<string, boolean> = { ...selected };
    if (allSelected) {
      allFilteredIds.forEach(id => { newSelected[id] = false; });
    } else {
      allFilteredIds.forEach(id => { newSelected[id] = true; });
    }
    setSelected(newSelected);
  }

  function handleToggleUser(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleAssign() {
    setAssigning(true);
    const toAssign = Object.entries(selected)
      .filter(([id, checked]) => checked && !userVideoMap[id])
      .map(([id]) => ({ user: id, video: videoId }));

    if (toAssign.length > 0) {
      await supabase.from("users_videos").insert(toAssign);
    }
    setAssigning(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-1">Assign Video to Users</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select users to assign <span className="font-semibold">&quot;{videoTitle}&quot;</span> to.
        </p>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="max-h-64 overflow-y-auto border rounded mb-3">
          <div className="flex items-center px-3 py-2 border-b">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <span className="text-sm font-medium">Select All ({filteredUsers.length})</span>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            filteredUsers.map(user => (
              <label
                key={user.id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={!!selected[user.id]}
                  onChange={() => handleToggleUser(user.id)}
                  className="mr-2"
                />
                <span className="flex-1">
                  <span className="font-medium">{user.full_name || user.email}</span>
                  <span className="block text-xs text-gray-500">{user.email}</span>
                </span>
                <span className={`inline-block text-xs font-semibold rounded-full px-2 py-0.5 ml-2
                  ${user.role === "admin"
                    ? "bg-gray-200 text-gray-800 border border-gray-300"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}>
                  {user.role}
                </span>
              </label>
            ))
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{selectedCount} users selected</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
              disabled={assigning}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-black text-white"
              onClick={handleAssign}
              disabled={assigning}
            >
              Assign Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
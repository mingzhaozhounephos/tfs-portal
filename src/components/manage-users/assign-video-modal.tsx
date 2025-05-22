import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useUserVideosStore } from '@/store/user-videos-store';
import { User } from '@/types';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';

interface AssignVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  assignedCount: number;
  onAfterAssign?: () => void;
}

export function AssignVideoModal({ isOpen, onClose, videoId, videoTitle, assignedCount, onAfterAssign }: AssignVideoModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const { users, loading, error, searchUsers } = useUsers();
  const { assignVideos } = useUserVideosStore();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch assigned users when modal opens or videoId changes
  useEffect(() => {
    if (!isOpen || !videoId) return;
    setLoadingAssigned(true);
    // Fetch assigned users for this video
    supabase
      .from('users_videos')
      .select('user')
      .eq('video', videoId)
      .then(({ data, error }) => {
        if (!error && data) {
          setSelectedUsers(data.map((row: { user: string }) => row.user));
        }
        setLoadingAssigned(false);
      });
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  // Filtered users for search
  const filteredUsers = searchQuery ? users.filter(
    (user: User) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : users;

  // Select All logic
  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers.includes(u.id));
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers(selectedUsers.filter(id => !filteredUsers.some(u => u.id === id)));
    } else {
      setSelectedUsers([
        ...selectedUsers,
        ...filteredUsers.filter(u => !selectedUsers.includes(u.id)).map(u => u.id)
      ]);
  }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Enable button if there are selected users or if there are currently assigned users (to allow unassigning all)
  const canAssign = selectedUsers.length > 0 || assignedCount > 0;

  const handleAssign = async () => {
    try {
      await assignVideos(videoId, selectedUsers);
      onClose();
      onAfterAssign?.();
    } catch (err) {
      console.error('Failed to assign videos:', err);
  }
  };

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay: semi-transparent black */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md mx-auto shadow-lg z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Assign Video to Users</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-xl px-2" aria-label="Close">&times;</button>
        </div>
        {/* Subtitle with video title */}
        <div className="text-sm text-gray-600 mb-4">
          Select users to assign <span className="font-semibold">&quot;{videoTitle}&quot;</span> to.
        </div>
        {/* Search */}
        <div className="w-full mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
              <svg className="lucide lucide-search w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto mb-4 border border-[#e6e6e6] ">
          {loading ? (
            <p className="p-4">Loading users...</p>
          ) : error ? (
            <p className="p-4 text-red-500">Error loading users: {error.message}</p>
          ) : (
            <>
              <div className="flex items-center px-3 py-2 border border-[#e6e6e6] bg-white sticky top-0 z-10">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="mr-2"
            />
                <span className="text-sm font-medium select-none">Select All ({filteredUsers.length})</span>
          </div>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No users found.</div>
          ) : (
                filteredUsers.map((user: User) => (
                  <div
                key={user.id}
                    className="flex items-center h-14 px-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleUserSelect(user.id)}
              >
                <input
                  type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                  className="mr-2"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{user.email}</div>
                      <div className="text-xs text-gray-500 truncate">{user.full_name}</div>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span>
                  </div>
            ))
              )}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{selectedUsers.length} users selected</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!canAssign}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
import {
  Users,
  Calendar,
  Video,
  CheckCircle,
  Mail,
  Trash2,
  Settings,
} from "lucide-react";
import { UserWithRole, UserStats, UserWithDetails } from "@/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUsersStore } from "@/store/users-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  user: UserWithRole;
  onAssignVideo: (userId: string) => void;
  stats: UserStats;
}

export function UserCard({ user, onAssignVideo, stats }: UserCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "driver">(
    (user.role as "admin" | "driver") || "driver"
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const updateUserRole = useUsersStore((state) => state.updateUserRole);

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      // Delete records from 'users_videos' table where user equals the logged-in user's id
      await supabase.from("users_videos").delete().eq("user", user.id);
      // Delete records from 'videos' table where admin_user_id equals the logged-in user's id
      if (user.role === "admin") {
        await supabase.from("videos").delete().eq("admin_user_id", user.id);
      }
      // Delete the user role record
      await supabase.from("user_roles").delete().eq("user", user.id);
      // Delete the user from the 'users' table
      await supabase.from("users").delete().eq("id", user.id);

      // Delete user from authentication // TODO: resume if we allow to delete user from authentication
      // const response = await fetch("/api/delete-user", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ userId: user.id }),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(
      //     error.message || "Failed to delete user from authentication"
      //   );
      // }
    } catch (error) {
      console.error("Error deleting user records:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      setShowManageModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      console.log("user.id: ", user.id);
      console.log("selectedRole: ", selectedRole);
      await updateUserRole(user.id, selectedRole);
      setShowManageModal(false);
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border relative"
      style={{ borderColor: "var(--border-default)" }}
    >
      {/* Inactive badge */}
      {user.is_active === false && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded z-20">
          inactive
        </span>
      )}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Users size={28} />
        </div>
        <div>
          <div className="font-bold text-lg">
            {user.full_name || user.email}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Mail size={14} className="text-gray-400" />
            {user.email}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-700 mb-2 gap-2">
        <div className="flex flex-col gap-2 flex-1">
          <span
            className="inline-block font-semibold border rounded-full px-3 py-0.5 bg-white text-black text-xs text-center w-fit mb-1"
            style={{ borderColor: "var(--border-default)" }}
          >
            {user.role}
          </span>
          <span className="flex items-center gap-1">
            <Video size={14} className="text-gray-400" />
            {`${stats.numAssigned} videos assigned`}
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-1 items-start">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            {user.created_at
              ? `Joined ${format(new Date(user.created_at), "MMM d, yyyy")}`
              : ""}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-gray-400" />
            {`${stats.completion}% completed`}
          </span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/users/${user.id}`)}
        className="w-full border rounded py-1 text-sm font-medium"
        style={{ borderColor: "var(--border-default)" }}
      >
        View Details
      </button>

      {/* Dropdown Menu */}
      {
        <div className="absolute top-3 right-3 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FEEBED] hover:bg-[#FFD6DB] transition"
                aria-label="Open menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="4" r="1.5" fill="#333" />
                  <circle cx="10" cy="10" r="1.5" fill="#333" />
                  <circle cx="10" cy="16" r="1.5" fill="#333" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-0">
              <DropdownMenuItem
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium group transition-colors group-hover:bg-[#FEEBED]"
              >
                <Settings className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" />
                <span className="text-gray-600 group-hover:text-black transition-colors">
                  Manage
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-b-md group transition-colors group-hover:bg-[#FEEBED]"
                style={{ color: "#EA384C" }}
              >
                <Trash2 className="w-4 h-4 group-hover:text-black text-[#EA384C] transition-colors" />
                <span className="group-hover:text-black text-[#EA384C] transition-colors">
                  Delete
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
            <div className="mb-4 text-center">
              <Trash2 className="w-10 h-10 text-[#EA384C] mx-auto mb-2" />
              <div className="text-lg font-semibold mb-2">Delete User</div>
              <div className="text-gray-600">
                Are you sure that you want to delete{" "}
                <span className="font-bold">{user.full_name}</span>?
              </div>
            </div>
            <div className="flex gap-2 w-full justify-center mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#EA384C] text-white font-medium hover:bg-[#EC4659] transition"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage User Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
            <div className="mb-4 text-center">
              <Settings className="w-10 h-10 text-[#EA384C] mx-auto mb-2" />
              <div className="text-lg font-semibold mb-2">Manage User</div>
              <div className="text-gray-600">
                {user.full_name || user.email}
                <br />
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </div>
            <div className="w-full mb-4">
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "admin" | "driver")
                }
              >
                <option value="driver">Driver</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="flex gap-2 w-full justify-center mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                onClick={() => setShowManageModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#EA384C] text-white font-medium hover:bg-[#EC4659] transition"
                onClick={handleUpdateRole}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

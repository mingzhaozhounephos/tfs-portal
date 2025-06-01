import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User, UserWithRole } from "@/types";
import { toast } from "sonner";

interface UsersStore {
  users: UserWithRole[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchUsers: (query: string) => UserWithRole[];
  updateUserRole: (
    userId: string,
    newRole: "admin" | "driver"
  ) => Promise<void>;
}

// Helper function to fetch users with roles
async function fetchUsersWithRoles() {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_roles!inner(role)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) throw new Error("No data returned from query");

  return data.map((user: any) => ({
    ...user,
    role: user.user_roles?.[0]?.role || null,
  })) as UserWithRole[];
}

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000; // 3 seconds

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh();
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        async () => {
          const store = useUsersStore.getState();
          if (store.initialized) {
            store.refresh();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        async () => {
          const store = useUsersStore.getState();
          if (store.initialized) {
            store.refresh();
          }
        }
      )
      .subscribe();
    set({ cleanup: () => supabase.removeChannel(channel) });
  },

  refresh: async () => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) return;
    lastRefresh = now;
    set({ loading: true });
    try {
      const usersWithRoles = await fetchUsersWithRoles();
      set({
        users: usersWithRoles,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },

  searchUsers: (query: string) => {
    const { users } = get();
    if (!query.trim()) return users;
    const searchTerm = query.toLowerCase();
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchTerm) ||
        (user.email?.toLowerCase() || "").includes(searchTerm)
    );
  },

  updateUserRole: async (userId: string, newRole: "admin" | "driver") => {
    try {
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user", userId);
      if (updateError) throw updateError;
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        ),
      }));
      toast.success("User role updated successfully");
    } catch (err) {
      toast.error("Failed to update user role");
      throw err;
    }
  },
}));

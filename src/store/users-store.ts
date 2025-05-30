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
  updateUserRole: (userId: string, newRole: "admin" | "driver") => Promise<void>;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Fetch users with their roles
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user, role");

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles: UserWithRole[] = users.map((user: User) => ({
        ...user,
        role: userRoles.find((ur) => ur.user === user.id)?.role || null,
      }));

      set({
        users: usersWithRoles,
        initialized: true,
        loading: false,
      });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },

  refresh: async () => {
    set({ loading: true });
    try {
      // Fetch users with their roles
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user, role");

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles: UserWithRole[] = users.map((user: User) => ({
        ...user,
        role: userRoles.find((ur) => ur.user === user.id)?.role || null,
      }));

      set({
        users: usersWithRoles,
        loading: false,
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
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(query.toLowerCase()),
    );
  },

  updateUserRole: async (userId: string, newRole: "admin" | "driver") => {
    try {
      // Update the role in user_roles table
      const { error: updateError } = await supabase
        .from("user_roles")
        .upsert({ user: userId, role: newRole });

      if (updateError) throw updateError;

      // Update the local state
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

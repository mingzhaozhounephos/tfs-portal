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

// Create a singleton promise to prevent multiple simultaneous initializations
let initializationPromise: Promise<void> | null = null;
let isInitializing = false;

// Helper function to fetch users with roles
async function fetchUsersWithRoles() {
  // Add timeout to the query
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Query timeout after 10 seconds")),
      10000
    );
  });

  const queryPromise = supabase
    .from("users")
    .select(
      `
      *,
      user_roles!inner(role)
    `
    )
    .order("created_at", { ascending: false });

  // Race between the query and timeout
  const { data, error } = (await Promise.race([
    queryPromise,
    timeoutPromise.then(() => ({
      data: null,
      error: new Error("Query timeout"),
    })),
  ])) as { data: any; error: any };

  if (error) throw error;
  if (!data) throw new Error("No data returned from query");

  return data.map((user: any) => ({
    ...user,
    role: user.user_roles?.[0]?.role || null,
  })) as UserWithRole[];
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    // If already initialized, return immediately
    if (get().initialized) {
      return;
    }

    // If initialization is in progress, wait for it
    if (isInitializing) {
      if (initializationPromise) {
        await initializationPromise;
      }
      return;
    }

    // Set initialization flag
    isInitializing = true;

    // Create new initialization promise
    initializationPromise = (async () => {
      try {
        // Double check initialization state after async gap
        if (get().initialized) {
          return;
        }

        set({ loading: true });

        const usersWithRoles = await fetchUsersWithRoles();

        // Subscribe to real-time changes
        const channel = supabase
          .channel("users-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users" },
            async () => {
              get().refresh();
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "user_roles" },
            async () => {
              get().refresh();
            }
          )
          .subscribe();

        set({
          users: usersWithRoles,
          initialized: true,
          loading: false,
          error: null,
          cleanup: () => supabase.removeChannel(channel),
        });
      } catch (err) {
        set({
          error: err as Error,
          loading: false,
        });
      } finally {
        isInitializing = false;
        initializationPromise = null;
      }
    })();

    // Wait for initialization to complete
    await initializationPromise;
  },

  refresh: async () => {
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
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(query.toLowerCase())
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

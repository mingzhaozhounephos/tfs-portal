import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserWithDetails } from "@/types";

interface AuthStore {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  user: User | null;
  userDetails: UserWithDetails | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<UserWithDetails | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  initialized: false,
  loading: true,
  error: null,
  user: null,
  userDetails: null,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        set({
          user: null,
          userDetails: null,
          loading: false,
          error: sessionError,
        });
        return;
      }
      const user = session?.user ?? null;
      let userDetails = null;
      if (user) {
        userDetails = await get().fetchUserDetails(user.id);
      }
      set({
        user,
        userDetails,
        loading: false,
        error: null,
      });

      // Listen for auth changes (only once)
      if (!get().initialized) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const user = session?.user ?? null;
          let userDetails = null;
          if (user) {
            userDetails = await get().fetchUserDetails(user.id);
          }
          set({
            user,
            userDetails,
            loading: false,
            error: null,
          });
        });
        // Store cleanup function if needed
        // const cleanup = () => subscription.unsubscribe();
      }
    } catch (error) {
      set({
        user: null,
        userDetails: null,
        loading: false,
        error: error as Error,
      });
    }
  },

  refresh: async () => {
    if (!get().initialized || get().loading) return;
    set({ loading: true });
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const refreshedUser = session?.user ?? null;
      let userDetails = null;
      if (refreshedUser) {
        userDetails = await get().fetchUserDetails(refreshedUser.id);
      }
      set({
        user: refreshedUser,
        userDetails,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        user: null,
        userDetails: null,
        loading: false,
        error: err as Error,
      });
    }
  },

  fetchUserDetails: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          role_info:user_roles!inner(*)
        `
        )
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as UserWithDetails;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  },
}));

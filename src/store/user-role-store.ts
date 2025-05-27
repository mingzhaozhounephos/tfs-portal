import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface UserRoleStore {
  role: "admin" | "driver" | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
  role: null,
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        set({
          role: null,
          loading: false,
          initialized: true,
        });
        return;
      }

      const { data: userRole, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (roleError) throw roleError;

      set({
        role: userRole?.role || null,
        loading: false,
        initialized: true,
      });

      // Subscribe to auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          set({ role: null });
          return;
        }

        if (session) {
          const { data: userRole, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (!roleError) {
            set({ role: userRole?.role || null });
          }
        }
      });

      // Store cleanup function
      const cleanup = () => {
        subscription.unsubscribe();
      };

      // Add cleanup to store
      set({ cleanup });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
        initialized: true,
      });
    }
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        set({
          role: null,
          loading: false,
        });
        return;
      }

      const { data: userRole, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (roleError) throw roleError;

      set({
        role: userRole?.role || null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err as Error,
        loading: false,
      });
    }
  },
}));

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

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000;

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
  role: null,
  loading: false,
  error: null,
  initialized: false,
  cleanup: undefined,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh();
    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        set({ role: null });
        return;
      }
      if (session) {
        await get().refresh();
      }
    });
    set({ cleanup: () => subscription.unsubscribe() });
  },

  refresh: async () => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) return;
    lastRefresh = now;
    set({ loading: true });
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        set({ role: null, loading: false });
        return;
      }
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user", session.user.id)
        .single();
      if (roleError) throw roleError;
      set({ role: userRole?.role || null, loading: false, error: null });
    } catch (err) {
      set({ error: err as Error, loading: false });
    }
  },
}));

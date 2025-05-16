import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface UserRoleStore {
  role: 'admin' | 'driver' | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
  role: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ role: null, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (error) throw error;

      set({ 
        role: data.role,
        initialized: true,
        loading: false 
      });

      // Subscribe to real-time changes
      const channel = supabase
        .channel('user-role-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'users',
            filter: `email=eq.${session.user.email}`
          },
          async (payload) => {
            if (payload.new) {
              set({ role: payload.new.role });
            }
          }
        )
        .subscribe();

      // Cleanup subscription on store reset
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      set({ 
        error: err as Error,
        loading: false 
      });
    }
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ role: null, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (error) throw error;

      set({ 
        role: data.role,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err as Error,
        loading: false 
      });
    }
  }
})); 
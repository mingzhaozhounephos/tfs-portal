import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface UsersStore {
  users: User[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchUsers: (query: string) => User[];
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    // If already initialized, don't fetch again
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Fetch initial data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        users: data as User[],
        initialized: true,
        loading: false 
      });

      // Subscribe to real-time changes
      const channel = supabase
        .channel('users-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          async () => {
            // Refresh data when changes occur
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && data) {
              set({ users: data as User[] });
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        users: data as User[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err as Error,
        loading: false 
      });
    }
  },

  searchUsers: (query: string) => {
    const { users } = get();
    return users.filter(
      user =>
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
  }
})); 
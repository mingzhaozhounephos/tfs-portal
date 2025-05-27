import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { toast } from 'sonner';

interface UsersStore {
  users: User[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  cleanup?: () => void;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchUsers: (query: string) => User[];
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
          async (payload) => {
            // Refresh data when changes occur
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && data) {
              set({ users: data as User[] });
            }

            // Show notification only for INSERT events
            if (payload.eventType === 'INSERT') {
              toast.success('User Added', {
                description: 'The new user has been added successfully.',
                duration: 3000,
              });
            }
          }
        )
        .subscribe();

      // Store cleanup function in state
      set({ cleanup: () => supabase.removeChannel(channel) });
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
        (user.email?.toLowerCase() || '').includes(query.toLowerCase())
    );
  }
})); 
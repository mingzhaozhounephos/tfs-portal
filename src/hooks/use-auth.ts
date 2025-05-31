import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserWithDetails } from "@/types";

interface AuthState {
  user: User | null;
  userDetails: UserWithDetails | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userDetails: null,
    loading: true,
  });

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          role_info:user_roles(*)
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
  };

  useEffect(() => {
    // Get initial session and user details
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      const userDetails = user ? await fetchUserDetails(user.id) : null;

      setState({
        user,
        userDetails,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      const userDetails = user ? await fetchUserDetails(user.id) : null;

      setState({
        user,
        userDetails,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: state.user,
    userDetails: state.userDetails,
    loading: state.loading,
  };
}

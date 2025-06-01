import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { User } from "@supabase/supabase-js";
import { UserWithDetails } from "@/types";

interface AuthState {
  user: User | null;
  userDetails: UserWithDetails | null;
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth() {
  const { user, userDetails, loading, error, initialize, refresh } =
    useAuthStore(
      (state: AuthState) => ({
        user: state.user,
        userDetails: state.userDetails,
        loading: state.loading,
        error: state.error,
        initialize: state.initialize,
        refresh: state.refresh,
      }),
      shallow
    );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { user, userDetails, loading, error };
}

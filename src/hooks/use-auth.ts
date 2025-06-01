import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
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
  const user = useAuthStore((state: AuthState) => state.user);
  const userDetails = useAuthStore((state: AuthState) => state.userDetails);
  const loading = useAuthStore((state: AuthState) => state.loading);
  const error = useAuthStore((state: AuthState) => state.error);
  const initialize = useAuthStore((state: AuthState) => state.initialize);
  const refresh = useAuthStore((state: AuthState) => state.refresh);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { user, userDetails, loading, error };
}

import { useEffect } from "react";
import { useUserRoleStore } from "@/store/user-role-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { Role } from "@/store/role-store";

interface UserRoleState {
  role: Role;
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useUserRole() {
  const { role, loading, error, initialize, refresh } = useUserRoleStore(
    (state) => ({
      role: state.role,
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

  return { role, loading, error };
}

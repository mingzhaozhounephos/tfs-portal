import { useEffect } from "react";
import { useRoleStore, Role } from "@/store/role-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

interface RoleState {
  role: Role;
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRole(): Role {
  const { role, loading, error, initialize, refresh } = useRoleStore(
    (state: RoleState) => ({
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

  return role;
}

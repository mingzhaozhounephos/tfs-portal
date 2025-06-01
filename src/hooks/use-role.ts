import { useEffect } from "react";
import { useRoleStore, Role } from "@/store/role-store";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

interface RoleState {
  role: Role;
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRole(): Role {
  const role = useRoleStore((state: RoleState) => state.role);
  const loading = useRoleStore((state: RoleState) => state.loading);
  const error = useRoleStore((state: RoleState) => state.error);
  const initialize = useRoleStore((state: RoleState) => state.initialize);
  const refresh = useRoleStore((state: RoleState) => state.refresh);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return role;
}

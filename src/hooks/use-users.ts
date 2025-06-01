import { useEffect } from "react";
import { useUsersStore } from "@/store/users-store";
import { useRefreshOnVisible } from "./use-refresh-on-visible";

export function useUsers() {
  const users = useUsersStore((state) => state.users);
  const loading = useUsersStore((state) => state.loading);
  const error = useUsersStore((state) => state.error);
  const initialize = useUsersStore((state) => state.initialize);
  const refresh = useUsersStore((state) => state.refresh);
  const searchUsers = useUsersStore((state) => state.searchUsers);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useRefreshOnVisible(refresh);

  return { users, loading, error, searchUsers, refresh };
}

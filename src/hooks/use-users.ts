import { useEffect } from "react";
import { useUsersStore } from "@/store/users-store";

export function useUsers() {
  const { users, loading, error, initialize, refresh, searchUsers } =
    useUsersStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    users,
    loading,
    error,
    searchUsers,
    refresh,
  };
}

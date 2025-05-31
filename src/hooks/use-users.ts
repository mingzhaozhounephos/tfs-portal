import { useEffect, useCallback } from "react";
import { useUsersStore } from "@/store/users-store";

export function useUsers() {
  const { users, loading, error, initialize, refresh, searchUsers } =
    useUsersStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Memoize the refresh callback to prevent unnecessary re-renders
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  }, [refresh]);

  // Handle visibility changes
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    users,
    loading,
    error,
    searchUsers,
    refresh,
  };
}

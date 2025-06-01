import { useEffect, useCallback, useMemo } from "react";
import { useUsersStore } from "@/store/users-store";

export function useUsers() {
  const store = useUsersStore();
  const { users, loading, error, initialize, refresh, searchUsers } = store;

  // Initialize only once when the component mounts
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!store.initialized && mounted) {
        await initialize();
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array since we only want to run this once

  // Memoize the refresh callback
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible" && store.initialized) {
      refresh();
    }
  }, [refresh, store.initialized]);

  // Handle visibility changes
  useEffect(() => {
    if (store.initialized) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [handleVisibilityChange, store.initialized]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      users,
      loading,
      error,
      searchUsers,
      refresh,
      initialized: store.initialized,
    }),
    [users, loading, error, searchUsers, refresh, store.initialized]
  );
}

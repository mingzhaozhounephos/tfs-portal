import { useEffect } from "react";
import { useUsersStore } from "@/store/users-store";
import { shallow } from "zustand/shallow";
import { useRefreshOnVisible } from "./use-refresh-on-visible";
import { User } from "@/types";

interface UsersState {
  users: User[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
}

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

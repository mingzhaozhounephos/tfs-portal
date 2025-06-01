import { create } from "zustand";
import { useAuthStore } from "./auth-store";

export type Role = "admin" | "driver";

interface RoleStore {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  role: Role;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

let lastRefresh = 0;
const REFRESH_THROTTLE = 3000;

export const useRoleStore = create<RoleStore>((set, get) => ({
  initialized: false,
  loading: true,
  error: null,
  role: "driver",

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await get().refresh();
  },

  refresh: async () => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) return;
    lastRefresh = now;
    const { userDetails } = useAuthStore.getState();
    if (!userDetails) {
      set({ role: "driver", loading: false });
      return;
    }
    set({ loading: true });
    try {
      const roleFromDb = userDetails.role_info?.role;
      const role = roleFromDb === "admin" ? "admin" : "driver";
      set({ role, loading: false, error: null });
    } catch (err) {
      set({ loading: false, error: err as Error });
    }
  },
}));

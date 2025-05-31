import { useMemo } from "react";
import { useAuth } from "./use-auth";

export type Role = "admin" | "driver";

export function useRole(): Role {
  const { userDetails } = useAuth();

  return useMemo(() => {
    const roleFromDb = userDetails?.role_info?.role;
    return roleFromDb === "admin" ? "admin" : "driver";
  }, [userDetails?.role_info?.role]);
}

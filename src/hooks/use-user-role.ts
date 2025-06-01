import { useEffect, useState } from "react";
import { User, UserWithRole } from "@/types";
import { supabase } from "@/lib/supabase";

export function useUserRole(user: User) {
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        setLoading(true);
        const { data: userRole, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user", user.id)
          .single();

        if (error) throw error;

        if (userRole) {
          setUserWithRole({
            ...user,
            role: userRole.role,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user role")
        );
      } finally {
        setLoading(false);
      }
    }
    fetchUserRole();
  }, [user]);

  return { userWithRole, loading, error };
}

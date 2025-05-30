"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useUsersStore } from "@/store/users-store";

export function UsersRealtimeListener() {
  const refresh = useUsersStore((state) => state.refresh);

  useEffect(() => {
    const channel = supabase
      .channel("users-changes-ui")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        async (payload) => {
          await refresh();
          if (payload.eventType?.toUpperCase() === "INSERT") {
            toast.success("User Added", {
              description: "The new user has been added successfully.",
              duration: 3000,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return null;
}

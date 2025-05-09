'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DriverDashboard } from "@/components/dashboard/driver-dashboard";

interface UserRecord {
  email: string;
  role: "admin" | "driver";
}

export default function DashboardPage() {
  const [role, setRole] = useState<"admin" | "driver" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const userEmail = session.user.email;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .single();

      if (error || !data) {
        // Optionally handle error or redirect
        router.replace("/login");
        return;
      }
      setRole(data.role);
      setIsLoading(false);
    }
    fetchUserRole();
  }, [router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }
  if (role === "driver") {
    return <DriverDashboard />;
  }
  return <div className="flex justify-center items-center min-h-screen">No role assigned.</div>;
}
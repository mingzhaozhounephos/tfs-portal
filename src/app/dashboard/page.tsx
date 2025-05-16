'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DriverDashboard } from "@/components/dashboard/driver-dashboard";
import { useUserRole } from "@/hooks/use-user-role";

export default function DashboardPage() {
  const { role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role === null) {
      router.replace("/login");
    }
  }, [role, router]);

  if (role === "admin") {
    return <AdminDashboard />;
  }
  if (role === "driver") {
    return <DriverDashboard />;
  }
  return null;
}
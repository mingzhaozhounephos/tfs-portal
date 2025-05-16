'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DriverDashboard } from "@/components/dashboard/driver-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
      // Do nothing if not logged in; let the user log in
    }
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!loading && role === null) {
      router.replace("/login");
    }
  }, [role, loading, router]);

  if (loading) {
    // Always show loading screen at the very beginning
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          TFS: Driver Training &amp; HR Portal
        </h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <span className="text-gray-500 text-base sm:text-lg font-medium tracking-wide">Redirecting...</span>
      </div>
    );
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }
  if (role === "driver") {
    return <DriverDashboard />;
  }
  // If role is null and not loading, the useEffect will redirect to /login
  return null;
}
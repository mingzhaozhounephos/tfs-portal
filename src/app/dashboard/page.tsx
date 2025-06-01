"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DriverDashboard } from "@/components/dashboard/driver-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const {
    user,
    userDetails,
    loading: authLoading,
    error: authError,
  } = useAuth();

  // Robust role extraction for array or object
  const role = Array.isArray(userDetails?.role_info)
    ? userDetails.role_info[0]?.role
    : userDetails?.role_info?.role ?? null;

  const router = useRouter();

  // console.log("DASHBOARD DEBUG", {
  //   user,
  //   userDetails,
  //   role,
  //   authLoading,
  //   authError,
  // });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          TFS: Driver Training &amp; HR Portal
        </h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <span className="text-gray-500 text-base sm:text-lg font-medium tracking-wide">
          Loading...
        </span>
      </div>
    );
  }

  if (user && !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 text-base sm:text-lg font-medium tracking-wide">
          You don't have the required permissions to access this page.
        </p>
      </div>
    );
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }
  if (role === "driver") {
    return <DriverDashboard />;
  }

  return null;
}

"use client";

import { SideMenu } from "@/components/side-menu";
import { User } from "@/types";
import { UserDetailsClient } from "@/components/manage-users/user-details-client";
import { UserDetailsCards } from "@/components/manage-users/user-details-cards";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssignVideoButton } from "@/components/manage-users/assign-video-button";

export default function UserDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/users");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchUser();
    }
  }, [id, router]);

  if (error) {
    return (
      <div className="flex h-screen min-h-screen">
        <SideMenu role={"admin"} active="manage-users" onNavigate={() => {}} />
        <div className="flex-1 h-screen overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/users")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-screen">
      <SideMenu role={"admin"} active="manage-users" onNavigate={() => {}} />
      <div className="flex-1 h-screen overflow-y-auto p-8 relative">
        <div className="flex items-start justify-between w-full mb-4">
          <img
            src="/images/Logo.jpg"
            alt="TFS Express Logistics"
            className="h-8 w-auto mb-2"
          />
        </div>
        <button
          onClick={() => router.push("/manage-users")}
          className="flex items-center gap-2 mb-4 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <path
              d="M11.25 14.25L6.75 9L11.25 3.75"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Users
        </button>
        {user && (
          <>
            <UserDetailsCards user={user} />
            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-xl font-bold text-black">Assigned Videos</h2>
              <AssignVideoButton user={user} />
            </div>
            <UserDetailsClient user={user} />
          </>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
          </div>
        )}
      </div>
    </div>
  );
}

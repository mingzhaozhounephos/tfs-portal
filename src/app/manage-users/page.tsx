"use client";

import { SideMenu } from "@/components/side-menu/side-menu";
import { ManageUsers } from "@/components/manage-users/manage-users";

export default function ManageUsersPage() {
  return (
    <div className="flex bg-[#f6fbf9] min-h-screen h-screen">
      <SideMenu role="admin" active="manage-users" onNavigate={() => {}} />
      <ManageUsers />
    </div>
  );
} 
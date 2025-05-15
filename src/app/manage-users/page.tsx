"use client";

import { SideMenu } from "@/components/side-menu/side-menu";
import { ManageUsers } from "@/components/manage-users/manage-users";

export default function ManageUsersPage() {
  return (
    <div className="flex h-screen min-h-screen">
      <SideMenu role="admin" active="manage-users" onNavigate={() => {}} />
      <div className="flex-1 h-screen overflow-y-auto">
        <ManageUsers />
      </div>
    </div>
  );
} 
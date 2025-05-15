"use client";

import { SideMenu } from "@/components/side-menu/side-menu";
import { ManageVideos } from "@/components/manage-videos/manage-videos";

export default function ManageVideosPage() {
  return (
    <div className="flex h-screen min-h-screen">
      <SideMenu role="admin" active="manage-videos" onNavigate={() => {}} />
      <div className="flex-1 h-screen overflow-y-auto">
        <ManageVideos />
      </div>
    </div>
  );
} 
"use client";

import { SideMenu } from "@/components/side-menu/side-menu";
import { ManageVideos } from "@/components/manage-videos/manage-videos";

export default function ManageVideosPage() {
  return (
    <div className="flex bg-[#f6fbf9] min-h-screen h-screen">
      <SideMenu role="admin" active="manage-videos" onNavigate={() => {}} />
      <ManageVideos />
    </div>
  );
} 
import { useState, useEffect, useMemo, useCallback } from "react";
import { VideoFormModal } from "./video-form-modal";
import { AdminVideoCard } from "@/components/share/admin-video-card";
import { useVideos } from "@/hooks/use-videos";
import { useAuth } from "@/hooks/use-auth";

const tags = ["All Videos", "Van", "Truck", "Office"];

export function ManageVideos() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Videos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const { user } = useAuth();
  const { videos, loading, searchVideos, refresh } = useVideos();

  // Memoize filtered videos to prevent recalculation on every render
  const filteredVideos = useMemo(() => {
    return videos.filter(
      (v) =>
        (selectedTag === "All Videos" ||
          v.category?.toLowerCase() === selectedTag.toLowerCase()) &&
        (v.title?.toLowerCase().includes(search.toLowerCase()) ||
          v.description?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [videos, selectedTag, search]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const handleAddVideo = useCallback(() => {
    setEditingVideo(null);
    setModalOpen(true);
  }, []);

  const handleEditVideo = useCallback((video: any) => {
    setEditingVideo(video);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    refresh();
    setModalOpen(false);
  }, [refresh]);

  return (
    <div className="flex-1 bg-white p-8 min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/images/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Training Videos</h1>
        <button
          className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
          onClick={handleAddVideo}
        >
          <svg width="18" height="18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9 5v8M5 9h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add Video
        </button>
      </div>
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
            <svg
              className="lucide lucide-search w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
      </div>
      {/* Tab Navigation */}
      <div
        className="flex w-fit rounded-lg p-1 mb-6 shadow-sm"
        style={{ backgroundColor: "#F1F5F9" }}
      >
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-4 py-1 rounded-lg transition font-medium
              ${
                selectedTag === tag
                  ? "bg-white text-black font-bold shadow"
                  : "bg-transparent text-gray-500 hover:text-black"
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            `}
            onClick={() => handleTagSelect(tag)}
            type="button"
            aria-pressed={selectedTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <AdminVideoCard
              key={video.id}
              video={video}
              showEdit={true}
              onEdit={() => handleEditVideo(video)}
              onAssignToUsers={() => {
                /* handle assign to users */
              }}
            />
          ))}
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
          </div>
        )}
      </div>
      <VideoFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        video={editingVideo}
        adminUserId={user?.id || ""}
      />
    </div>
  );
}

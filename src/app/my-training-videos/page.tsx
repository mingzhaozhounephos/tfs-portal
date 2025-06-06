"use client";

import { useState, useMemo } from "react";
import { SideMenu } from "@/components/side-menu";
import { TrainingVideosGrid } from "@/components/share/training-videos-grid";
// import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { TrainingVideoModal } from "@/components/share/training-video-modal";
import { TrainingVideo } from "@/types";
import { useDriverUsersVideos } from "@/hooks/use-driver-users-videos";

const FILTERS = [
  { label: "All Videos", value: "all" },
  { label: "Renewal Required", value: "renewal" },
  { label: "Van", value: "van" },
  { label: "Truck", value: "truck" },
  { label: "Office", value: "office" },
];

function isAnnualRenewalDue(video: TrainingVideo) {
  if (!video.is_annual_renewal || !video.assigned_date) return false;
  const assigned = new Date(video.assigned_date);
  const now = new Date();
  return now.getTime() - assigned.getTime() > 365 * 24 * 60 * 60 * 1000;
}

export default function MyTrainingVideosPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<TrainingVideo | null>(null);
  // const { userDetails } = useAuth();
  const role = useRole();
  const { assignments, loading } = useDriverUsersVideos();

  // Transform assignments to videos with image
  const videos = useMemo(
    () =>
      assignments.map((item) => ({
        id: item.video.id,
        title: item.video.title || "",
        category: item.video.category || "",
        description: item.video.description || "",
        created_at: item.video.created_at,
        duration: item.video.duration || "",
        youtube_url: item.video.youtube_url || undefined,
        image: "/placeholder.webp",
        assigned_date: item.assigned_date || undefined,
        last_watched: item.last_watched || undefined,
        is_annual_renewal: item.video.is_annual_renewal || false,
        renewal_due: undefined,
        is_completed: item.is_completed || false,
        modified_date: item.modified_date || undefined,
        last_action: item.last_action || undefined,
      })),
    [assignments]
  );

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let result = videos;
    if (filter === "renewal") {
      result = result.filter((v) => v.is_annual_renewal);
    } else if (["van", "truck", "office"].includes(filter)) {
      result = result.filter((v) => v.category?.toLowerCase() === filter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          (v.title?.toLowerCase() || "").includes(s) ||
          (v.description?.toLowerCase() || "").includes(s)
      );
    }
    return result;
  }, [videos, filter, search]);

  // Count videos needing annual renewal
  const annualRenewalCount = useMemo(
    () =>
      videos.filter(
        (v) => v.is_annual_renewal && v.assigned_date && isAnnualRenewalDue(v)
      ).length,
    [videos]
  );

  // Handler to show the video modal
  function handleShowVideoModal(video: TrainingVideo) {
    setModalVideo(video);
    setShowModal(true);
  }

  return (
    <div className="flex bg-white min-h-screen h-screen">
      <SideMenu role={role} active="my-training-videos" onNavigate={() => {}} />
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA384C]" />
          </div>
        )}
        <div className="flex flex-col gap-2 items-start mb-2">
          <img
            src="/images/Logo.jpg"
            alt="TFS Express Logistics"
            className="h-8 w-auto mb-2"
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          {/* <img src="/images/Logo.jpg" alt="TFS Express Logistics" className="h-8 w-auto mb-2" /> */}
          <h1 className="text-3xl font-bold">My Training Videos</h1>
          {annualRenewalCount > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-1 pt-[7px] rounded-full text-sm font-semibold bg-red-500 text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <polygon
                  points="10,2 19,18 1,18"
                  fill="#fff"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <polygon points="10,3.5 17.5,17 2.5,17" fill="#dc2626" />
                <text
                  x="10"
                  y="15"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#fff"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                >
                  !
                </text>
              </svg>
              {annualRenewalCount} video{annualRenewalCount > 1 ? "s" : ""} need
              annual renewal
            </span>
          )}
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
        </div>
        {/* Tab Navigation */}
        <div
          className="flex w-fit rounded-lg p-1 mb-6 shadow-sm"
          style={{ backgroundColor: "#F1F5F9" }}
        >
          {FILTERS.map((f) => (
            <div key={f.value} className="relative inline-block">
              <button
                className={`px-4 py-1 rounded-lg transition font-medium
                  ${
                    filter === f.value
                      ? "bg-white text-black font-bold shadow"
                      : "bg-transparent text-gray-500 hover:text-black"
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
                `}
                onClick={() => setFilter(f.value)}
                type="button"
                aria-pressed={filter === f.value}
              >
                {f.label}
                {f.value === "all" && (
                  <span className="ml-2">({videos.length})</span>
                )}
              </button>
              {f.label === "Renewal Required" && annualRenewalCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold shadow border-2 border-white">
                  {annualRenewalCount}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <TrainingVideosGrid
            videos={filteredVideos}
            onStartTraining={handleShowVideoModal}
          />
        </div>
        <TrainingVideoModal
          open={showModal && !!modalVideo?.youtube_url}
          onClose={() => setShowModal(false)}
          title={modalVideo?.title || ""}
          youtubeId={
            modalVideo?.youtube_url ? modalVideo.youtube_url.split("v=")[1] : ""
          }
          videoId={modalVideo?.id || ""}
        />
      </main>
    </div>
  );
}

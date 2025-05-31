import { useState } from "react";
import { SideMenu } from "@/components/side-menu";
import { TrainingVideosGrid } from "@/components/share/training-videos-grid";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import { TrainingVideoModal } from "@/components/share/training-video-modal";
import { getYouTubeId } from "@/lib/youtube";
import { useDriverUsersVideos } from "@/hooks/use-driver-users-videos";
import { TrainingVideo } from "@/types";

export function DriverDashboard() {
  const { userDetails } = useAuth();
  const { role } = useUserRole();
  const { assignments, loading } = useDriverUsersVideos();
  const [showModal, setShowModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<TrainingVideo | null>(null);

  // Transform assignments to the expected video format
  const videos: TrainingVideo[] = assignments.map((item) => ({
    id: item.video.id,
    title: item.video.title || "",
    category: item.video.category || "",
    description: item.video.description || "",
    created_at: item.video.created_at,
    duration: item.video.duration || "",
    youtube_url: item.video.youtube_url || undefined,
    assigned_date: item.assigned_date || undefined,
    last_watched: item.last_watched || undefined,
    renewal_due: undefined, // Not in the database
    is_completed: item.is_completed || false,
    modified_date: item.modified_date || undefined,
    last_action: item.last_action || undefined,
    is_annual_renewal: item.video.is_annual_renewal || false,
  }));

  // Progress calculation
  const assignedVideos = videos.length;
  const completedVideos = videos.filter((v) => v.is_completed).length;
  const progress =
    assignedVideos === 0
      ? 0
      : Math.round((completedVideos / assignedVideos) * 100);

  // Find the most recent activity
  const mostRecent = videos
    .filter((v) => v.modified_date)
    .sort(
      (a, b) =>
        new Date(b.modified_date!).getTime() -
        new Date(a.modified_date!).getTime()
    )[0];

  let activityText = "No activity yet";
  let actionText = "";

  if (mostRecent && mostRecent.modified_date) {
    const modDate = new Date(mostRecent.modified_date);
    const now = new Date();
    const diffMs = now.getTime() - modDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (
      modDate.getDate() === now.getDate() &&
      modDate.getMonth() === now.getMonth() &&
      modDate.getFullYear() === now.getFullYear()
    ) {
      activityText = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      activityText = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }

    if (mostRecent.last_action && mostRecent.title) {
      actionText = `${
        mostRecent.last_action[0].toUpperCase() +
        mostRecent.last_action.slice(1)
      } "${mostRecent.title}"`;
    }
  }

  const userName = userDetails?.full_name || userDetails?.email || "Driver";
  const userEmail = userDetails?.email || "";

  // Show modal with YouTube video
  function handleShowVideoModal(video: TrainingVideo) {
    setModalVideo(video);
    setShowModal(true);
  }

  return (
    <div className="flex bg-white min-h-screen h-screen">
      <SideMenu
        role={role || "driver"}
        active="dashboard"
        onNavigate={() => {}}
      />
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA384C]" />
          </div>
        )}
        <div className="flex flex-col gap-2 items-center mb-6 w-full">
          <div className="flex items-start justify-between w-full">
            <img
              src="/images/Logo.jpg"
              alt="TFS Express Logistics"
              className="h-8 w-auto mb-2"
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
              Welcome, {userName} ({userEmail})
            </div>
          </div>
        </div>
        {/* Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">
                Your Progress
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                <svg
                  className="w-5 h-5 text-[#EA384C]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-[#EA384C] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {completedVideos} of {assignedVideos} videos completed
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">
                Assigned Videos
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-[#EA384C]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <path d="m14 9 3 3-3 3"></path>
                  <path d="M10 12H7"></path>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold">{assignedVideos}</div>
            <div className="text-xs text-gray-500">
              {assignedVideos - completedVideos} videos remaining
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">
                Last Activity
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-[#EA384C]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold">{activityText}</div>
            {actionText && (
              <div className="text-xs text-gray-500">{actionText}</div>
            )}
          </div>
        </div>
        <div className="mb-4 mt-8">
          <h2 className="text-xl font-bold mb-4">Your Training Videos</h2>
          <div className="relative">
            <TrainingVideosGrid
              videos={videos}
              onStartTraining={handleShowVideoModal}
            />
          </div>
        </div>
        {showModal && modalVideo && (
          <TrainingVideoModal
            open={true}
            onClose={() => setShowModal(false)}
            title={modalVideo.title}
            youtubeId={getYouTubeId(modalVideo.youtube_url) || ""}
            videoId={modalVideo.id}
          />
        )}
      </main>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import { formatDate } from "@/lib/format-date";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  created_at: string | Date;
  duration: string;
  assigned_date?: string | Date;
  last_watched?: string | Date;
  youtube_url?: string;
  renewal_due?: string;
  is_completed?: boolean;
  modified_date?: string;
  last_action?: string;
  is_annual_renewal?: boolean;
}

interface TrainingVideosGridProps {
  videos: TrainingVideo[];
  onStartTraining?: (video: TrainingVideo) => void;
}

function isAnnualRenewalDue(video: TrainingVideo): boolean {
  if (!video.is_annual_renewal || !video.assigned_date) return false;
  const assigned = new Date(video.assigned_date);
  const now = new Date();
  // 1 year = 365 days
  return now.getTime() - assigned.getTime() > 365 * 24 * 60 * 60 * 1000;
}

export function TrainingVideosGrid({
  videos,
  onStartTraining,
}: TrainingVideosGridProps) {
  const { user } = useAuth();

  async function handleStartTraining(video: TrainingVideo) {
    if (!user || !video.id) return;
    try {
      // Find the users_videos record for this user and video, join videos table
      const { data: userVideo, error } = await supabase
        .from("users_videos")
        .select("*, video:videos(*)")
        .eq("user", user.id)
        .eq("video", video.id)
        .single();
      if (error) {
        // Optionally handle error (e.g., not assigned)
        return;
      }
      const now = new Date().toISOString();
      // If annual renewal is due, reset assigned_date and completion
      const isAnnualRenewal =
        userVideo.video?.is_annual_renewal &&
        userVideo.assigned_date &&
        new Date().getTime() - new Date(userVideo.assigned_date).getTime() >
          365 * 24 * 60 * 60 * 1000;
      if (isAnnualRenewal) {
        await supabase
          .from("users_videos")
          .update({
            last_watched: now,
            modified_date: now,
            assigned_date: now,
            last_action: "watched",
            is_completed: false,
          })
          .eq("id", userVideo.id);
      } else {
        await supabase
          .from("users_videos")
          .update({
            last_watched: now,
            modified_date: now,
            last_action: userVideo.is_completed ? "completed" : "watched",
          })
          .eq("id", userVideo.id);
      }
    } catch (err) {
      // Optionally handle error
    }

    if (onStartTraining) onStartTraining(video);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, idx) => {
        const youtubeId = getYouTubeId(video.youtube_url);
        const thumbnailUrl = youtubeId
          ? getYouTubeThumbnail(youtubeId)
          : video.image || "/placeholder.webp";
        const renewalDue = isAnnualRenewalDue(video);
        return (
          <div
            key={video.id || idx}
            className="group bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative border border-transparent hover:border-[#EA384C] hover:shadow-lg transition-all duration-200"
          >
            <div className="font-bold text-lg mb-1">{video.title}</div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={
                  `inline-block text-xs font-semibold rounded-full px-3 py-0.5 ` +
                  (video.category?.toLowerCase() === "office"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : video.category?.toLowerCase() === "truck"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : video.category?.toLowerCase() === "van"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200")
                }
                style={{ minWidth: "fit-content" }}
              >
                {video.category}
              </span>
              {/* Renewal Required Badge */}
              {renewalDue && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 mr-0.5"
                  >
                    <path
                      d="M16.5 10A6.5 6.5 0 1 1 10 3.5"
                      stroke="#A0522D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 1.5v4a.5.5 0 0 0 .5.5h4"
                      stroke="#A0522D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Renewal Required
                </span>
              )}
            </div>
            <div
              className="text-xs text-gray-600 mb-2 line-clamp-2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {video.description}
            </div>
            <div
              className="relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer mb-2"
              onClick={() => handleStartTraining(video)}
            >
              {/* Annual Renewal Due Badge */}
              {renewalDue && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-semibold shadow-lg">
                  <svg
                    className="w-4 h-4 mr-1 text-white"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
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
                    >
                      !
                    </text>
                  </svg>
                  Annual Renewal Due
                </span>
              )}
              <Image
                src={thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {youtubeId && (
                <>
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 z-10" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                    <span className="rounded-full bg-white/60 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-[#EA384C]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <polygon
                          points="10,8 16,12 10,16"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 gap-6 mb-2">
              <div className="flex flex-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-calendar w-3 h-3 mr-1"
                >
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span>
                  {video.created_at ? formatDate(video.created_at) : ""}
                </span>
              </div>
              <div className="flex flex-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-clock w-3 h-3 mr-1"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{video.duration}</span>
              </div>
            </div>
            {/* Last Watched */}
            {video.last_watched && (
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-calendar w-3 h-3 mr-1"
                >
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span>
                  Last watched:{" "}
                  {new Date(video.last_watched).toISOString().slice(0, 10)}
                </span>
              </div>
            )}
            <button
              className="mt-auto bg-[#EA384C] text-white rounded-lg py-2 font-medium hover:bg-[#EC4659] transition"
              onClick={() => handleStartTraining(video)}
            >
              {renewalDue ? "Watch Again (Required)" : "Start Training"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

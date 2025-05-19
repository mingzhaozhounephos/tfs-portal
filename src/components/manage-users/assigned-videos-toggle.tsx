'use client';

import { useState, useMemo } from "react";
import { useUserVideos } from "@/hooks/use-user-videos";

interface AssignedVideosToggleProps {
  userId: string;
  onFilterChange?: (filter: string) => void;
}

const FILTERS = [
  { label: "All Videos", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Renewal Required", value: "renewal" },
  { label: "Van", value: "van" },
  { label: "Truck", value: "truck" },
  { label: "Office", value: "office" },
];

export function AssignedVideosToggle({ userId, onFilterChange }: AssignedVideosToggleProps) {
  const { videos, loading } = useUserVideos(userId);
  const [filter, setFilter] = useState("all");

  // Compute counts for each filter
  const counts = useMemo(() => {
    const pending = videos.filter(v => !v.is_completed).length;
    const completed = videos.filter(v => v.is_completed).length;
    const renewal = videos.filter(v => typeof v.video === 'object' && v.video.renewal_required).length;
    const van = videos.filter(v => typeof v.video === 'object' && v.video.category === "van").length;
    const truck = videos.filter(v => typeof v.video === 'object' && v.video.category === "truck").length;
    const office = videos.filter(v => typeof v.video === 'object' && v.video.category === "office").length;
    return {
      all: videos.length,
      pending,
      completed,
      renewal,
      van,
      truck,
      office,
    };
  }, [videos]);

  function handleFilterChange(val: string) {
    setFilter(val);
    onFilterChange?.(val);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map(f => (
        <button
          key={f.value}
          className={`relative px-4 py-2 rounded-full border text-sm font-medium transition
            ${filter === f.value ? "bg-black text-white border-black" : "bg-white text-black border-gray-200 hover:bg-gray-100"}`}
          onClick={() => handleFilterChange(f.value)}
        >
          {f.label}
          {f.value === "all" && (
            <span className="ml-2 text-xs font-semibold">({counts.all})</span>
          )}
          {f.value === "pending" && (
            <span className="ml-2 text-xs font-semibold">({counts.pending})</span>
          )}
          {f.value === "completed" && (
            <span className="ml-2 text-xs font-semibold">({counts.completed})</span>
          )}
          {f.value === "renewal" && counts.renewal > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{counts.renewal}</span>
          )}
        </button>
      ))}
    </div>
  );
} 
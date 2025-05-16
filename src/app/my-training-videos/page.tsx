"use client";

import { useEffect, useState, useMemo } from "react";
import { SideMenu } from "@/components/side-menu/side-menu";
import { TrainingVideosGrid } from "@/components/training-videos/training-videos-grid";
// import { supabase } from '@/lib/supabase';

const mockVideos = [
  {
    id: "1",
    title: "Safe Driving Techniques",
    category: "van",
    description: "Learn essential safe driving techniques for all road conditions. This comprehensive guide covers defensive driving, proper signaling, and maintaining safe distances.",
    image: "/rick-astley.jpg",
    created_at: "2023-04-12",
    duration: "15:30",
    assigned_date: "2023-04-12",
    last_watched: "2023-04-15",
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: true,
    renewal_due: true,
  },
  {
    id: "2",
    title: "Vehicle Maintenance Basics",
    category: "truck",
    description: "Understanding basic vehicle maintenance can prevent breakdowns and accidents. This video provides fluid checks, tire pressure, and other essential maintenance tasks.",
    image: "/rick-astley.jpg",
    created_at: "2023-05-05",
    duration: "12:45",
    assigned_date: "2023-05-05",
    last_watched: undefined,
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: false,
    renewal_due: false,
  },
  {
    id: "3",
    title: "Handling Adverse Weather Conditions",
    category: "van",
    description: "Learn how to safely navigate through rain, snow, fog, and other challenging weather conditions. This video provides practical tips for maintaining control of your vehicle.",
    image: "/rick-astley.jpg",
    created_at: "2023-06-20",
    duration: "18:20",
    assigned_date: "2023-01-10",
    last_watched: undefined,
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: true,
    renewal_due: true,
  },
  {
    id: "4",
    title: "Defensive Driving Strategies",
    category: "truck",
    description: "Defensive driving can help you avoid accidents caused by other drivers' mistakes. Learn how to anticipate hazards and respond appropriately to keep yourself and others safe.",
    image: "/rick-astley.jpg",
    created_at: "2023-07-08",
    duration: "20:15",
    assigned_date: "2023-07-08",
    last_watched: undefined,
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: false,
    renewal_due: false,
  },
  {
    id: "5",
    title: "Commercial Vehicle Regulations",
    category: "truck",
    description: "Stay compliant with the latest commercial vehicle regulations. This video covers hours of service, load securement, and other important regulatory requirements.",
    image: "/rick-astley.jpg",
    created_at: "2023-08-15",
    duration: "25:10",
    assigned_date: "2023-06-20",
    last_watched: "2023-06-20",
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: true,
    renewal_due: true,
  },
  {
    id: "6",
    title: "Eco-Friendly Driving Practices",
    category: "van",
    description: "Reduce fuel consumption and emissions with these eco-friendly driving techniques. Learn how small changes in your driving habits can make a big difference for the environment.",
    image: "/rick-astley.jpg",
    created_at: "2023-09-03",
    duration: "14:30",
    assigned_date: "2023-09-03",
    last_watched: undefined,
    youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    renewal_required: false,
    renewal_due: false,
  },
];

const FILTERS = [
  { label: "All Videos", value: "all" },
  { label: "Renewal Required", value: "renewal" },
  { label: "Van", value: "van" },
  { label: "Truck", value: "truck" },
  { label: "Office", value: "office" },
];

export default function MyTrainingVideosPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [videos, setVideos] = useState(mockVideos);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let result = videos;
    if (filter === "renewal") {
      result = result.filter(v => v.renewal_required);
    } else if (["van", "truck", "office"].includes(filter)) {
      result = result.filter(v => v.category.toLowerCase() === filter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(
        v => v.title.toLowerCase().includes(s) || v.description.toLowerCase().includes(s)
      );
    }
    return result;
  }, [videos, filter, search]);

  return (
    <div className="flex bg-[#F7F9FA] min-h-screen h-screen">
      <SideMenu role="driver" active="my-training-videos" onNavigate={() => {}} />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">My Training Videos</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition
                ${filter === f.value ? "bg-black text-white border-black" : "bg-white text-black border-gray-200 hover:bg-gray-100"}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value === "all" && (
                <span className="ml-2 text-xs font-semibold">({videos.length})</span>
              )}
            </button>
          ))}
        </div>
        <TrainingVideosGrid videos={filteredVideos} />
      </main>
    </div>
  );
} 
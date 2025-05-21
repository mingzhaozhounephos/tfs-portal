"use client";

import { useEffect, useState, useMemo } from "react";
import { SideMenu } from "@/components/side-menu/side-menu";
import { TrainingVideosGrid } from "@/components/training-videos/training-videos-grid";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface Video {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  created_at: string;
  duration: string;
  youtube_url: string;
  assigned_date?: string;
  last_watched?: string;
  renewal_required?: boolean;
  renewal_due?: string;
  is_completed?: boolean;
  modified_date?: string;
  last_action?: string;
  is_annual_renewal?: boolean;
}

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
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('users_videos')
          .select('*, video:videos(*)')
          .eq('user', user.id);

        if (error) throw error;

        const transformedVideos = data.map(item => ({
          ...item.video,
          assigned_date: item.assigned_date,
          last_watched: item.last_watched,
          renewal_required: item.renewal_required,
          renewal_due: item.renewal_due,
          is_completed: item.is_completed,
          modified_date: item.modified_date,
          last_action: item.last_action,
          is_annual_renewal: item.is_annual_renewal,
        }));

        setVideos(transformedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Subscribe to changes
    const subscription = supabase
      .channel('users_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users_videos',
          filter: `user=eq.${user.id}`
        },
        async () => {
          await fetchVideos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
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
        {loading ? (
          <div className="text-center py-4">Loading videos...</div>
        ) : (
          <TrainingVideosGrid videos={filteredVideos} />
        )}
      </main>
    </div>
  );
} 
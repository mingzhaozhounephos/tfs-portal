import { useState, useEffect } from "react";
import { VideoFormModal } from "./video-form-modal";
import { supabase } from "@/lib/supabase";
import { AdminVideoCard } from "@/components/admin-video-card/admin-video-card";

// const videoData = [
//   {
//     title: "Safe Driving Techniques",
//     tag: "van",
//     description: "Learn essential safe driving techniques for all road conditions. This comprehensive guide...",
//     image: "/rick-astley.jpg",
//     date: "Apr 12, 2023",
//     duration: "15:30",
//     assigned: 15,
//     completed: "80%",
//   },
//   {
//     title: "Vehicle Maintenance Basics",
//     tag: "truck",
//     description: "Understanding basic vehicle maintenance can prevent breakdowns and accidents. This video...",
//     image: "/rick-astley.jpg",
//     date: "May 5, 2023",
//     duration: "12:45",
//     assigned: 12,
//     completed: "65%",
//   },
//   {
//     title: "Handling Adverse Weather Conditions",
//     tag: "van",
//     description: "Learn how to safely navigate through rain, snow, fog, and other challenging weather…",
//     image: "/rick-astley.jpg",
//     date: "Jun 20, 2023",
//     duration: "18:20",
//     assigned: 18,
//     completed: "70%",
//   },
//   {
//     title: "Defensive Driving Strategies",
//     tag: "truck",
//     description: "Defensive driving can help you avoid accidents caused by other drivers' mistakes. Learn how…",
//     image: "/rick-astley.jpg",
//     date: "Jul 8, 2023",
//     duration: "20:15",
//     assigned: 20,
//     completed: "85%",
//   },
//   {
//     title: "Commercial Vehicle Regulations",
//     tag: "truck",
//     description: "Stay compliant with the latest commercial vehicle regulations. This video covers hours of…",
//     image: "/rick-astley.jpg",
//     date: "Aug 15, 2023",
//     duration: "25:10",
//     assigned: 10,
//     completed: "50%",
//   },
//   {
//     title: "Eco-Friendly Driving Practices",
//     tag: "van",
//     description: "Reduce fuel consumption and emissions with these eco-friendly driving techniques. Learn…",
//     image: "/rick-astley.jpg",
//     date: "Sep 3, 2023",
//     duration: "14:30",
//     assigned: 8,
//     completed: "40%",
//   },
// ];

const tags = ["All Videos", "Van", "Truck", "Office"];

export function ManageVideos() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Videos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [adminUserId, setAdminUserId] = useState<string>("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch admin user id and videos on mount
  useEffect(() => {
    let channel: any;
    async function fetchUserAndVideos() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAdminUserId(session.user.id);
        // Fetch videos for this admin
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("admin_user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (!error && data) setVideos(data);

        // Real-time subscription
        channel = supabase
          .channel('videos-admin')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'videos', filter: `admin_user_id=eq.${session.user.id}` },
            payload => {
              // Refetch videos on any change
              supabase
                .from("videos")
                .select("*")
                .eq("admin_user_id", session.user.id)
                .order("created_at", { ascending: false })
                .then(({ data, error }) => {
                  if (!error && data) setVideos(data);
                });
            }
          )
          .subscribe();
      }
      setLoading(false);
    }
    fetchUserAndVideos();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [modalOpen]);

  const filteredVideos = videos.filter(
    v =>
      (selectedTag === "All Videos" || v.category?.toLowerCase() === selectedTag.toLowerCase()) &&
      (v.title?.toLowerCase().includes(search.toLowerCase()) ||
        v.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 p-8 bg-[#f6fbf9] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Training Videos</h1>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-900"
          onClick={() => { setEditingVideo(null); setModalOpen(true); }}
        >
          <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2"/><path d="M9 5v8M5 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Add Video
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 mb-6">
        {tags.map(tag => (
          <button
            key={tag}
            className={`px-4 py-2 rounded-full border text-sm font-medium ${
              selectedTag === tag
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300"
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredVideos.map((video, i) => (
          <AdminVideoCard
            key={i}
            video={video}
            showEdit={true}
            onEdit={() => { setEditingVideo(video); setModalOpen(true); }}
            onAssignToUsers={() => {/* handle assign to users */}}
          />
        ))}
      </div>
      <VideoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {/* Optionally refresh videos here */}}
        video={editingVideo}
        adminUserId={adminUserId}
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import { VideoFormModal } from "./video-form-modal";
import { supabase } from "@/lib/supabase";
import { AdminVideoCard } from "@/components/admin-video-card/admin-video-card";

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
    <div className="flex-1 p-8 bg-[#F7F9FA] min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img src="/images/Logo.jpg" alt="TFS Express Logistics" className="h-8 w-auto mb-2" />
      </div>
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
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
            <svg className="lucide lucide-search w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
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
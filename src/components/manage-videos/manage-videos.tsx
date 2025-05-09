import { useState, useEffect } from "react";
import { VideoFormModal } from "./video-form-modal";
import { supabase } from "@/lib/supabase";

const videoData = [
  {
    title: "Safe Driving Techniques",
    tag: "van",
    description: "Learn essential safe driving techniques for all road conditions. This comprehensive guide...",
    image: "/rick-astley.jpg",
    date: "Apr 12, 2023",
    duration: "15:30",
    assigned: 15,
    completed: "80%",
  },
  {
    title: "Vehicle Maintenance Basics",
    tag: "truck",
    description: "Understanding basic vehicle maintenance can prevent breakdowns and accidents. This video...",
    image: "/rick-astley.jpg",
    date: "May 5, 2023",
    duration: "12:45",
    assigned: 12,
    completed: "65%",
  },
  {
    title: "Handling Adverse Weather Conditions",
    tag: "van",
    description: "Learn how to safely navigate through rain, snow, fog, and other challenging weather…",
    image: "/rick-astley.jpg",
    date: "Jun 20, 2023",
    duration: "18:20",
    assigned: 18,
    completed: "70%",
  },
  {
    title: "Defensive Driving Strategies",
    tag: "truck",
    description: "Defensive driving can help you avoid accidents caused by other drivers' mistakes. Learn how…",
    image: "/rick-astley.jpg",
    date: "Jul 8, 2023",
    duration: "20:15",
    assigned: 20,
    completed: "85%",
  },
  {
    title: "Commercial Vehicle Regulations",
    tag: "truck",
    description: "Stay compliant with the latest commercial vehicle regulations. This video covers hours of…",
    image: "/rick-astley.jpg",
    date: "Aug 15, 2023",
    duration: "25:10",
    assigned: 10,
    completed: "50%",
  },
  {
    title: "Eco-Friendly Driving Practices",
    tag: "van",
    description: "Reduce fuel consumption and emissions with these eco-friendly driving techniques. Learn…",
    image: "/rick-astley.jpg",
    date: "Sep 3, 2023",
    duration: "14:30",
    assigned: 8,
    completed: "40%",
  },
];

const tags = ["All Videos", "Van", "Truck", "Office"];

export function ManageVideos() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Videos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [adminUserId, setAdminUserId] = useState<string>("");

  // Fetch admin user id on mount
  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setAdminUserId(session.user.id);
    }
    fetchUser();
  }, []);

  const filteredVideos = videoData.filter(
    v =>
      (selectedTag === "All Videos" || v.tag.toLowerCase() === selectedTag.toLowerCase()) &&
      (v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase()))
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
          <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative">
            {/* Pencil icon for edit */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
              onClick={() => { setEditingVideo(video); setModalOpen(true); }}
              aria-label="Edit video"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M14.7 3.29a1 1 0 0 1 1.41 1.42l-9.08 9.08a1 1 0 0 0-.26.46l-1 3a1 1 0 0 0 1.26 1.26l3-1a1 1 0 0 0 .46-.26l9.08-9.08a1 1 0 0 0-1.42-1.42l-9.08 9.08a1 1 0 0 1-.46.26l-3 1a1 1 0 0 1-1.26-1.26l1-3a1 1 0 0 1 .26-.46l9.08-9.08z" fill="currentColor"/>
              </svg>
            </button>
            <div className="font-bold">{video.title}</div>
            <span className={`inline-block text-xs rounded px-2 py-0.5 mb-1 ${
              video.tag === "van"
                ? "bg-blue-100 text-blue-700"
                : video.tag === "truck"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {video.tag}
            </span>
            <div className="text-xs text-gray-600 mb-2">{video.description}</div>
            <div className="relative aspect-video rounded overflow-hidden mb-2">
              <img src={video.image} alt={video.title} className="object-cover w-full h-full" />
              <button className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/80 rounded-full p-2">
                  <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><polygon points="13,11 23,16 13,21" fill="#fff"/></svg>
                </span>
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{video.date}</span>
              <span>{video.duration}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{video.assigned} assigned</span>
              <span>{video.completed} completed</span>
            </div>
            <button
              className="mt-2 w-full border rounded py-1 text-sm font-medium"
              // Assign to Users button remains at the bottom
              onClick={() => {/* handle assign to users */}}
            >
              Assign to Users
            </button>
          </div>
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
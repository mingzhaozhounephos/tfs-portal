import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface VideoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  video?: {
    id?: string;
    title: string;
    description: string;
    youtube_url: string;
    category: string;
    duration?: string;
    is_annual_renewal?: boolean;
  };
  adminUserId: string;
}

const categories = ["van", "truck", "office"];

export function VideoFormModal({
  open,
  onClose,
  onSuccess,
  video,
  adminUserId,
}: VideoFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [duration, setDuration] = useState("");
  const [isAnnualRenewal, setIsAnnualRenewal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setDescription(video.description || "");
      setYoutubeUrl(video.youtube_url || "");
      setCategory(video.category || categories[0]);
      setDuration(video.duration || "");
      setIsAnnualRenewal(video.is_annual_renewal || false);
    } else {
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setCategory(categories[0]);
      setDuration("");
      setIsAnnualRenewal(false);
    }
  }, [video, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title,
      description,
      youtube_url: youtubeUrl,
      category,
      duration,
      admin_user_id: adminUserId,
      is_annual_renewal: isAnnualRenewal,
    };

    let error;
    if (video && video.id) {
      // Update
      ({ error } = await supabase
        .from("videos")
        .update(payload)
        .eq("id", video.id));
    } else {
      // Insert
      ({ error } = await supabase.from("videos").insert([payload]));
    }

    setIsLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-1">
          {video ? "Edit Training Video" : "Add New Training Video"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {video
            ? "Edit the YouTube video in your training library."
            : "Add a YouTube video to your training library."}
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus-visible:outline-none focus:outline-auto focus-visible:outline-auto focus:outline-[#EA384C] focus-visible:outline-[#EA384C]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter video title"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus-visible:outline-none focus:outline-auto focus-visible:outline-auto focus:outline-[#EA384C] focus-visible:outline-[#EA384C]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter video description"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">YouTube URL</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus-visible:outline-none focus:outline-auto focus-visible:outline-auto focus:outline-[#EA384C] focus-visible:outline-[#EA384C]"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus-visible:outline-none focus:outline-auto focus-visible:outline-auto focus:outline-[#EA384C] focus-visible:outline-[#EA384C]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (optional)</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus-visible:outline-none focus:outline-auto focus-visible:outline-auto focus:outline-[#EA384C] focus-visible:outline-[#EA384C]"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="10:00"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnnualRenewal"
              checked={isAnnualRenewal}
              onChange={(e) => setIsAnnualRenewal(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isAnnualRenewal" className="text-sm">
              Requires annual renewal
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              style={{ borderColor: "var(--border-default)" }}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#EA384C] text-white border hover:bg-[#EC4659]"
              style={{ borderColor: "var(--border-default)" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Processing
                </span>
              ) : video ? (
                "Save Changes"
              ) : (
                "Add Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';

interface TrainingVideoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  youtubeId: string;
}

export function TrainingVideoModal({ open, onClose, title, youtubeId }: TrainingVideoModalProps) {
  if (!open || !youtubeId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="font-bold text-lg mb-2">{title}</div>
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg w-full h-full"
          />
        </div>
      </div>
    </div>
  );
} 
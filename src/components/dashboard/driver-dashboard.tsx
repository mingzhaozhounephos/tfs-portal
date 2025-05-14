import { useState, useEffect } from 'react';
import { SideMenu } from '@/components/side-menu/side-menu';
import { TrainingVideosGrid } from '@/components/training-videos/training-videos-grid';
import { supabase } from '@/lib/supabase';

const mockVideos = [
  {
    id: '1',
    title: 'Workplace Harassment Prevention',
    category: 'office',
    description: 'Understand what constitutes workplace harassment and how to prevent it. This video covers company policies, reporting procedures, and creating a respectful work…',
    image: '/rick-astley.jpg',
    created_at: '2023-12-08',
    duration: '28:15',
    youtube_url: 'https://youtu.be/dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Data Security Best Practices',
    category: 'office',
    description: 'Protect sensitive company and customer data with these security best practices. Learn about password management, phishing prevention, and secure data handling.',
    image: '/rick-astley.jpg',
    created_at: '2023-11-12',
    duration: '22:30',
    youtube_url: 'https://youtu.be/dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'Office Safety Procedures',
    category: 'office',
    description: 'Learn essential safety procedures for the office environment. This video covers ergonomics, fire safety, and emergency protocols to ensure a safe workplace.',
    image: '/rick-astley.jpg',
    created_at: '2023-10-05',
    duration: '16:45',
    youtube_url: 'https://youtu.be/dQw4w9WgXcQ',
  },
];

export function DriverDashboard() {
  // TODO: Replace with real user and video data
  const [videos, setVideos] = useState(mockVideos);

  // Example stats (replace with real data)
  const progress = 0;
  const assignedVideos = 9;
  const lastActivity = '2 days ago';
  const userName = 'Driver';
  const userEmail = 'driver@driver.com';

  return (
    <div className="flex bg-[#f6fbf9] min-h-screen h-screen">
      <SideMenu role="driver" active="dashboard" onNavigate={() => {}} />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, {userName} ({userEmail})
          </div>
        </div>
        {/* Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="font-semibold">Your Progress</div>
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="text-xs text-gray-500">0 of {assignedVideos} videos completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="font-semibold">Assigned Videos</div>
            <div className="text-2xl font-bold">{assignedVideos}</div>
            <div className="text-xs text-gray-500">{assignedVideos} videos remaining</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="font-semibold">Last Activity</div>
            <div className="text-2xl font-bold">{lastActivity}</div>
            <div className="text-xs text-gray-500">Completed "Safe Driving Techniques"</div>
          </div>
        </div>
        <div className="mb-4 mt-8">
          <h2 className="text-xl font-bold mb-4">Your Training Videos</h2>
          <TrainingVideosGrid videos={videos} />
        </div>
      </main>
    </div>
  );
}
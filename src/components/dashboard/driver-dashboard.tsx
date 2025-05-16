import { useState, useEffect } from 'react';
import { SideMenu } from '@/components/side-menu/side-menu';
import { TrainingVideosGrid } from '@/components/training-videos/training-videos-grid';
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
}

export function DriverDashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('users_videos')
          .select(`
            *,
            videos (
              id,
              title,
              category,
              description,
              image,
              created_at,
              duration,
              youtube_url
            )
          `)
          .eq('user', user.id)
          .eq('is_completed', false);

        if (error) throw error;

        // Transform the data to match our video structure
        const transformedVideos = data.map(item => ({
          ...item.videos,
          assigned_date: item.assigned_date,
          last_watched: item.last_watched,
          renewal_required: item.renewal_required,
          renewal_due: item.renewal_due
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
        async (payload) => {
          // Refetch all videos when there's a change
          await fetchVideos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Example stats (replace with real data)
  const progress = 0;
  const assignedVideos = videos.length;
  const lastActivity = '2 days ago';
  const userName = user?.user_metadata?.full_name || 'Driver';
  const userEmail = user?.email || '';

  return (
    <div className="flex bg-[#F7F9FA] min-h-screen h-screen">
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
            <div className="text-xs text-gray-500">Completed &quot;Safe Driving Techniques&quot;</div>
          </div>
        </div>
        <div className="mb-4 mt-8">
          <h2 className="text-xl font-bold mb-4">Your Training Videos</h2>
          {loading ? (
            <div className="text-center py-4">Loading videos...</div>
          ) : (
            <TrainingVideosGrid videos={videos} />
          )}
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/format-date';
import { SideMenu } from '@/components/side-menu/side-menu';
import { TrainingVideosGrid } from '@/components/training-videos/training-videos-grid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { TrainingVideoModal } from '@/components/training-videos/training-video-modal';

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

function getYouTubeId(url?: string) {
  if (!url) return '';
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

function getYouTubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function DriverDashboard() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('users_videos')
          .select('*, modified_date, last_action, video:videos(*)')
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
        console.error('Error fetching videos:', error, error?.message, error?.details);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
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

  // Progress calculation
  const assignedVideos = videos.length;
  const completedVideos = videos.filter(v => v.is_completed).length;
  const progress = assignedVideos === 0 ? 0 : Math.round((completedVideos / assignedVideos) * 100);

  // Find the most recent activity
  const mostRecent = videos
    .filter(v => v.modified_date)
    .sort((a, b) => new Date(b.modified_date!).getTime() - new Date(a.modified_date!).getTime())[0];

  let activityText = 'No activity yet';
  let actionText = '';

  if (mostRecent && mostRecent.modified_date) {
    const modDate = new Date(mostRecent.modified_date);
    const now = new Date();
    const diffMs = now.getTime() - modDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (
      modDate.getDate() === now.getDate() &&
      modDate.getMonth() === now.getMonth() &&
      modDate.getFullYear() === now.getFullYear()
    ) {
      activityText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      activityText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    if (mostRecent.last_action && mostRecent.title) {
      actionText = `${mostRecent.last_action[0].toUpperCase() + mostRecent.last_action.slice(1)} "${mostRecent.title}"`;
    }
  }

  const userName = user?.user_metadata?.full_name || 'Driver';
  const userEmail = user?.email || '';

  // Show modal with YouTube video
  function handleShowVideoModal(video: Video) {
    setModalVideo(video);
    setShowModal(true);
  }

  return (
    <div className="flex bg-[#F7F9FA] min-h-screen h-screen">
      <SideMenu role={role || 'driver'} active="dashboard" onNavigate={() => {}} />
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
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">Your Progress</div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-green-200 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{completedVideos} of {assignedVideos} videos completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">Assigned Videos</div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <path d="m14 9 3 3-3 3"></path>
                <path d="M10 12H7"></path>
              </svg>
            </div>
            <div className="text-2xl font-bold">{assignedVideos}</div>
            <div className="text-xs text-gray-500">{assignedVideos} videos remaining</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">Last Activity</div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="text-2xl font-bold">{activityText}</div>
            {actionText && (
              <div className="text-xs text-gray-500">{actionText}</div>
            )}
          </div>
        </div>
        <div className="mb-4 mt-8">
          <h2 className="text-xl font-bold mb-4">Your Training Videos</h2>
          {loading ? (
            <div className="text-center py-4">Loading videos...</div>
          ) : (
            <TrainingVideosGrid
              videos={videos}
              onStartTraining={handleShowVideoModal}
            />
          )}
        </div>
        {/* YouTube Modal */}
        <TrainingVideoModal
          open={showModal && !!modalVideo?.youtube_url}
          onClose={() => setShowModal(false)}
          title={modalVideo?.title || ''}
          youtubeId={getYouTubeId(modalVideo?.youtube_url)}
        />
      </main>
    </div>
  );
}
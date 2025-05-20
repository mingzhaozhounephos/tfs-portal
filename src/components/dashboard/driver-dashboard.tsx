import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/format-date';
import { SideMenu } from '@/components/side-menu/side-menu';
import { TrainingVideosGrid } from '@/components/training-videos/training-videos-grid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';

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
        }));
        console.log('transformedVideos', transformedVideos)

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

  console.log(mostRecent)

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
              {/* Icon: Lucide Activity */}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{progress}%</div>
            {/* Progress bar */}
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
              {/* Icon: Lucide Activity */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="m14 9 3 3-3 3"></path><path d="M10 12H7"></path></svg>
            </div>
            <div className="text-2xl font-bold">{assignedVideos}</div>
            <div className="text-xs text-gray-500">{assignedVideos} videos remaining</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="tracking-tight text-sm font-medium">Last Activity</div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, idx) => {
                const youtubeId = getYouTubeId(video.youtube_url);
                const thumbnailUrl = youtubeId
                  ? getYouTubeThumbnail(youtubeId)
                  : '/placeholder.webp';
                return (
                  <div key={video.id || idx} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative">
                    <div className="font-bold text-lg mb-1">{video.title}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={
                          `inline-block text-xs font-semibold rounded-full px-3 py-0.5 ` +
                          (video.category?.toLowerCase() === 'office'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : video.category?.toLowerCase() === 'truck'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : video.category?.toLowerCase() === 'van'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200')
                        }
                        style={{ minWidth: 'fit-content' }}
                      >
                        {video.category}
                      </span>
                    </div>
                    <div
                      className="text-xs text-gray-600 mb-2 line-clamp-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {video.description}
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg group cursor-pointer mb-2" onClick={() => youtubeId && window.open(video.youtube_url, '_blank')}>
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="object-cover w-full h-full rounded-lg"
                        loading="lazy"
                      />
                      {youtubeId && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-white/60 flex items-center justify-center">
                            <svg className="w-16 h-16 text-black/70" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-6 mb-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-3 h-3 mr-1"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                        <span>{video.created_at ? formatDate(video.created_at) : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-3 h-3 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>{video.duration}</span>
                      </div>
                    </div>
                    <button
                      className="mt-auto bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-900 transition"
                      onClick={() => window.open(video.youtube_url, '_blank')}
                    >
                      Start Training
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
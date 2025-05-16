import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { videoId, userIds } = await request.json();

    if (!videoId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const assignments = userIds.map(userId => ({
      user: userId,
      video: videoId
    }));

    const { error } = await supabaseAdmin
      .from('users_videos')
      .insert(assignments);

    if (error) {
      console.error('Failed to assign video:', error);
      return NextResponse.json(
        { error: 'Failed to assign video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in assign-video route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
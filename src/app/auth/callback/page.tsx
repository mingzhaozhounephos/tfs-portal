'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (!error) {
          const userId = data.session?.user.id;
          const userEmail = data.session?.user.email;
          const userMeta = data.session?.user.user_metadata || {};
          const fullName = userMeta.name || null;
          const role = userMeta.role || null;

          if (userId && userEmail) {
            // Check if user record exists
            const { data: existing } = await supabase
              .from('users')
              .select('id')
              .eq('id', userId)
              .maybeSingle();

            if (!existing) {
              // No record: insert new user with id from auth session, full_name, and role
              await supabase
                .from('users')
                .insert([{
                  id: userId,
                  email: userEmail,
                  full_name: fullName,
                  role: role,
                }]);
            }
          }
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }

    handleAuth();
  }, [router]);

  return <div>Signing you in...</div>;
}
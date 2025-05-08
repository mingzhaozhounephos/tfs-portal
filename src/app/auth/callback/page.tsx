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
          const userEmail = data.session?.user.email;
          if (userEmail) {
            // Check if user record exists
            const { data: existing, error: findError } = await supabase
              .from('users')
              .select('id')
              .eq('email', userEmail)
              .maybeSingle();

            if (!existing) {
              // No record: insert new user
              await supabase
                .from('users')
                .insert([{ email: userEmail }]);
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
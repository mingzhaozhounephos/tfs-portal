"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const {
          data: { session },
          error,
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          router.replace("/login");
          return;
        }

        if (session) {
          const userId = session.user.id;
          const userEmail = session.user.email;
          const userMeta = session.user.user_metadata;
          const fullName = userMeta.name;
          const role = userMeta.role;

          if (userId && userEmail) {
            // Check if user record exists
            const { data: existing } = await supabase
              .from("users")
              .select("id")
              .eq("id", userId)
              .maybeSingle();

            if (!existing) {
              // No record: insert new user with id from auth session and full_name
              await supabase.from("users").insert([
                {
                  id: userId,
                  email: userEmail,
                  full_name: fullName,
                  is_active: true,
                },
              ]);

              // Create user role record
              await supabase.from("user_roles").insert([
                {
                  user: userId,
                  role: role,
                },
              ]);
            } else {
              await supabase
                .from("users")
                .update({
                  is_active: true,
                })
                .eq("id", userId);
            }

            // If user is coming from invitation, redirect to password reset
            if (userMeta.from_invitation) {
              router.replace("/auth/reset-password");
              return;
            }
          }
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    }

    handleAuth();
  }, [router]);

  return <div>Signing you in...</div>;
}

'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      setIsChecking(false);
    }
    checkSession();
  }, [router]);

  if (isChecking) {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          TFS: Driver Training &amp; HR Portal
        </h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <span className="text-gray-500 text-base sm:text-lg font-medium tracking-wide">Redirecting...</span>
    </div>
  );
  }

  // Optionally, return null or a blank div if you want nothing after redirect
  return null;
}

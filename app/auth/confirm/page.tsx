"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthConfirm() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // Read hash from URL (#access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setStatus("Sign-in failed. Please try again.");
          setTimeout(() => router.replace("/"), 2000);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace("/"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("campus_id")
          .eq("id", user.id)
          .maybeSingle();

        router.replace(profile?.campus_id ? "/home" : "/onboarding");
        return;
      }

      // No hash — check if already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("campus_id")
          .eq("id", session.user.id)
          .maybeSingle();
        router.replace(profile?.campus_id ? "/home" : "/onboarding");
      } else {
        router.replace("/");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-3xl mb-4 animate-pulse">✨</div>
        <p className="text-gray-600 font-medium">{status}</p>
      </div>
    </div>
  );
}

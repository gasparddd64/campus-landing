"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Handles Supabase implicit flow where session is in the URL hash (#access_token=...)
export default function AuthConfirm() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("campus_id")
          .eq("id", session.user.id)
          .maybeSingle();

        router.replace(profile?.campus_id ? "/home" : "/onboarding");
      }
    });

    // Also check immediately in case already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("campus_id")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            router.replace(profile?.campus_id ? "/home" : "/onboarding");
          });
      }
    });
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-3xl mb-4">✨</div>
        <p className="text-gray-600 font-medium">Signing you in…</p>
      </div>
    </div>
  );
}

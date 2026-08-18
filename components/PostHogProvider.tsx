"use client";

import { useEffect } from "react";
import { initPostHog, trackEvent } from "@/lib/posthog";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
    trackEvent("session_start");
  }, []);

  return <>{children}</>;
}

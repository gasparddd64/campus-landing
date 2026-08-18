"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || key === "phc_placeholder") return;

  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

export function trackEvent(
  event: "signup_completed" | "first_content_created" | "listing_closed" | "session_start",
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || key === "phc_placeholder") return;
  posthog.capture(event, properties);
}

export { posthog };

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EDU_WHITELIST_DOMAINS = [
  "mit.edu",
  "stanford.edu",
  "harvard.edu",
  "columbia.edu",
  "nyu.edu",
  "ucla.edu",
  "usc.edu",
  "uchicago.edu",
  "yale.edu",
  "princeton.edu",
  "upenn.edu",
  "cornell.edu",
  "gatech.edu",
  "cmu.edu",
  "umich.edu",
  "berkeley.edu",
  "ucdavis.edu",
  "ucsb.edu",
  "ucsd.edu",
  "purdue.edu",
  "illinois.edu",
  "wisc.edu",
  "umn.edu",
  "bu.edu",
  "northeastern.edu",
  "tufts.edu",
  "bc.edu",
  "brandeis.edu",
  "american.edu",
  "gwu.edu",
  "georgetown.edu",
];

function isEduEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain.endsWith(".edu")) return false;
  return true;
}

function isWhitelisted(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return EDU_WHITELIST_DOMAINS.includes(domain);
}

type State = "idle" | "loading" | "sent" | "waitlist" | "error";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();

    if (!isEduEmail(trimmed)) {
      setError("Please use your university .edu email address.");
      return;
    }

    if (!isWhitelisted(trimmed)) {
      // Save to waitlist and show message
      setState("loading");
      await supabase.from("waitlist").upsert({ email: trimmed });
      setState("waitlist");
      return;
    }

    setState("loading");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setState("error");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="card px-8 py-6 max-w-md mx-auto text-center">
        <div className="text-3xl mb-3">📬</div>
        <h2 className="font-semibold text-gray-900 mb-1">Check your inbox</h2>
        <p className="text-gray-500 text-sm">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in
          — no password needed.
        </p>
      </div>
    );
  }

  if (state === "waitlist") {
    return (
      <div className="card px-8 py-6 max-w-md mx-auto text-center">
        <div className="text-3xl mb-3">🙌</div>
        <h2 className="font-semibold text-gray-900 mb-1">
          You&apos;re on the list
        </h2>
        <p className="text-gray-500 text-sm">
          Your campus isn&apos;t open yet, but we&apos;ve saved your email. We&apos;ll reach
          out as soon as we launch there.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@university.edu"
          required
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-primary whitespace-nowrap"
        >
          {state === "loading" ? "..." : "Get started"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500 text-left">{error}</p>}
    </form>
  );
}

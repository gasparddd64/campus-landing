"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostComposer({
  cohortId,
  displayName,
}: {
  cohortId: string;
  displayName: string;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohort_id: cohortId, body: body.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to post");
    } else {
      setBody("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-xl p-4 mb-4"
    >
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share something with your cohort..."
            rows={3}
            maxLength={4000}
            className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none border-0 focus:outline-none"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{body.length}/4000</span>
            <button
              type="submit"
              disabled={submitting || body.trim().length === 0}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

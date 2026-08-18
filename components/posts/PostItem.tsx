"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PostData = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { display_name: string } | null;
  reactions: number;
  userReacted: boolean;
  replies: PostData[];
};

export default function PostItem({
  post,
  currentUserId,
  cohortId,
}: {
  post: PostData;
  currentUserId: string;
  cohortId: string;
}) {
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reacted, setReacted] = useState(post.userReacted);
  const [reactionCount, setReactionCount] = useState(post.reactions);
  const router = useRouter();

  async function toggleReaction() {
    const method = reacted ? "DELETE" : "POST";
    setReacted(!reacted);
    setReactionCount((c) => c + (reacted ? -1 : 1));
    await fetch(`/api/posts/${post.id}/reactions`, { method });
    router.refresh();
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohort_id: cohortId,
        parent_id: post.id,
        body: replyBody.trim(),
      }),
    });
    setReplyBody("");
    setReplying(false);
    setSubmitting(false);
    router.refresh();
  }

  const displayName = post.profiles?.display_name ?? "Unknown";
  const initials = displayName.charAt(0).toUpperCase();
  const timeAgo = formatTimeAgo(post.created_at);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {displayName}
            </span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.body}</p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={toggleReaction}
              className={`flex items-center gap-1 text-sm transition-colors ${
                reacted ? "text-indigo-600 font-medium" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>👍</span>
              <span>{reactionCount > 0 ? reactionCount : ""}</span>
            </button>
            <button
              onClick={() => setReplying(!replying)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Reply
            </button>
            {post.replies.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                {expanded
                  ? "Hide replies"
                  : `${post.replies.length} repl${post.replies.length === 1 ? "y" : "ies"}`}
              </button>
            )}
          </div>

          {replying && (
            <form onSubmit={submitReply} className="mt-3">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                maxLength={4000}
                className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-indigo-300 resize-none"
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={submitting || !replyBody.trim()}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setReplying(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {expanded && post.replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-3">
              {post.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                    {(reply.profiles?.display_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">
                        {reply.profiles?.display_name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

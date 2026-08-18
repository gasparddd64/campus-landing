"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithMeta } from "./page";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Avatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "xs";
}) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";
  return (
    <div
      className={`${sizeClass} rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PostCard({
  post,
  userId,
  cohortId,
  depth = 0,
}: {
  post: PostWithMeta;
  userId: string;
  cohortId: string;
  depth?: number;
}) {
  const supabase = createClient();
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reactions, setReactions] = useState<{ profile_id: string }[]>(
    post.post_reactions
  );
  const [replies, setReplies] = useState<PostWithMeta[]>(post.replies ?? []);
  const liked = reactions.some((r) => r.profile_id === userId);

  async function toggleReaction() {
    if (liked) {
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("profile_id", userId);
      setReactions((prev) => prev.filter((r) => r.profile_id !== userId));
    } else {
      await supabase
        .from("post_reactions")
        .insert({ post_id: post.id, profile_id: userId });
      setReactions((prev) => [...prev, { profile_id: userId }]);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    const { data } = await supabase
      .from("posts")
      .insert({
        cohort_id: cohortId,
        author_id: userId,
        parent_id: post.id,
        body: replyText.trim(),
      })
      .select("*, profiles(display_name, avatar_url), post_reactions(profile_id)")
      .single();
    if (data) {
      const newReply = { ...data, replies: [] } as PostWithMeta;
      setReplies((prev) => [...prev, newReply]);
      setRepliesOpen(true);
    }
    setReplyText("");
    setReplyOpen(false);
    setSubmittingReply(false);
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-2" : ""}>
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex gap-3">
          <Avatar name={post.profiles.display_name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {post.profiles.display_name}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(post.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.body}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={toggleReaction}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  liked ? "text-blue-600 font-medium" : "text-gray-400 hover:text-blue-500"
                }`}
              >
                👍 {reactions.length > 0 ? reactions.length : ""}
              </button>
              {depth === 0 && (
                <button
                  onClick={() => setReplyOpen((o) => !o)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Reply
                </button>
              )}
              {depth === 0 && replies.length > 0 && (
                <button
                  onClick={() => setRepliesOpen((o) => !o)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {repliesOpen ? "▲" : "▼"} {replies.length} repl
                  {replies.length === 1 ? "y" : "ies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {replyOpen && depth === 0 && (
          <form onSubmit={submitReply} className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={4000}
            />
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Send
            </button>
          </form>
        )}
      </div>

      {depth === 0 && repliesOpen && replies.length > 0 && (
        <div className="space-y-1">
          {replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              userId={userId}
              cohortId={cohortId}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedClient({
  cohortId,
  userId,
  displayName,
  initialPosts,
}: {
  cohortId: string;
  userId: string;
  displayName: string;
  initialPosts: PostWithMeta[];
}) {
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithMeta[]>(initialPosts);
  const [composerText, setComposerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `cohort_id=eq.${cohortId}`,
        },
        async (payload) => {
          const newPost = payload.new as {
            id: string;
            parent_id: string | null;
            author_id: string;
            body: string;
            cohort_id: string;
            created_at: string;
          };

          if (newPost.author_id === userId) return; // already added optimistically

          const { data: fullPost } = await supabase
            .from("posts")
            .select("*, profiles(display_name, avatar_url), post_reactions(profile_id)")
            .eq("id", newPost.id)
            .single();

          if (!fullPost) return;
          const post = { ...fullPost, replies: [] } as PostWithMeta;

          if (post.parent_id === null) {
            setPosts((prev) => [post, ...prev]);
          } else {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === post.parent_id
                  ? { ...p, replies: [...(p.replies ?? []), post] }
                  : p
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cohortId, userId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = composerText.trim();
    if (!body) return;
    setSubmitting(true);

    const { data } = await supabase
      .from("posts")
      .insert({ cohort_id: cohortId, author_id: userId, body })
      .select("*, profiles(display_name, avatar_url), post_reactions(profile_id)")
      .single();

    if (data) {
      const newPost = { ...data, replies: [] } as PostWithMeta;
      setPosts((prev) => [newPost, ...prev]);
    }

    setComposerText("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-3">
      {/* Composer */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar name={displayName} />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Share something with your cohort..."
              rows={3}
              maxLength={4000}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !composerText.trim()}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">👋</p>
          <p className="text-sm">Be the first to post in your cohort!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            userId={userId}
            cohortId={cohortId}
          />
        ))
      )}
    </div>
  );
}

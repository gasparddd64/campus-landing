"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function MessageThread({
  conversationId,
  userId,
  initialMessages,
  accepted,
  isParticipantA,
  isParticipantB,
  otherName,
}: {
  conversationId: string;
  userId: string;
  initialMessages: MessageRow[];
  accepted: boolean;
  isParticipantA: boolean;
  isParticipantB: boolean;
  otherName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as MessageRow;
          if (msg.sender_id === userId) return; // already added
          setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, supabase]);

  // Check if requester has already sent a message (participant_a, not accepted)
  const myMessages = messages.filter((m) => m.sender_id === userId);
  const canSend =
    accepted ||
    isParticipantB ||
    (isParticipantA && !accepted && myMessages.length === 0);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !canSend) return;
    setSending(true);

    const { data } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: text.trim(),
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data as MessageRow]);
    }
    setText("");
    setSending(false);
  }

  async function handleAccept() {
    setAccepting(true);
    await supabase
      .from("conversations")
      .update({ accepted: true })
      .eq("id", conversationId);
    setAccepting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full">
      {/* Accept banner */}
      {!accepted && isParticipantB && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            {otherName} wants to connect with you.
          </p>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {accepting ? "Accepting..." : "Accept"}
          </button>
        </div>
      )}

      {!accepted && isParticipantA && (
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2">
          <p className="text-xs text-gray-500 text-center">
            Waiting for {otherName} to accept your message request.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 max-h-[calc(100vh-180px)]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hi!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                <p>{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMine ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        {canSend ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              maxLength={4000}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        ) : isParticipantA && !accepted ? (
          <p className="text-sm text-center text-gray-400">
            You can send one message to start a conversation. Waiting for
            acceptance.
          </p>
        ) : (
          <p className="text-sm text-center text-gray-400">
            Accept the request to reply.
          </p>
        )}
      </div>
    </div>
  );
}

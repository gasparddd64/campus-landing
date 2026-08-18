"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StartConversationButton({
  userId,
  targetId,
  existingConvoId,
}: {
  userId: string;
  targetId: string;
  existingConvoId: string | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleMessage() {
    if (existingConvoId) {
      router.push(`/messages/${existingConvoId}`);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ participant_a: userId, participant_b: targetId })
      .select("id")
      .single();
    setLoading(false);
    if (!error && data) {
      router.push(`/messages/${data.id}`);
    }
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex-shrink-0 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "..." : existingConvoId ? "Message" : "Message"}
    </button>
  );
}

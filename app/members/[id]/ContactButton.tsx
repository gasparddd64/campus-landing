"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ContactButton({
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

  async function handleContact() {
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
      onClick={handleContact}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Opening..." : existingConvoId ? "Continue conversation" : "Send a message"}
    </button>
  );
}

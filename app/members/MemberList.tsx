"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  program: string | null;
  bio: string | null;
  languages: string[];
  origin_country: string | null;
  origin_country_visible: boolean;
};

export default function MemberList({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleMessage(memberId: string) {
    setLoading(memberId);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_b: memberId }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    }
    setLoading(null);
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-sm">No members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
            {member.display_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {member.display_name}
            </p>
            {member.program && (
              <p className="text-xs text-gray-500 truncate">{member.program}</p>
            )}
            {member.languages.length > 0 && (
              <p className="text-xs text-gray-400">
                {member.languages.join(", ")}
              </p>
            )}
            {member.origin_country_visible && member.origin_country && (
              <p className="text-xs text-gray-400">
                From {member.origin_country}
              </p>
            )}
          </div>
          <button
            onClick={() => handleMessage(member.id)}
            disabled={loading === member.id}
            className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 disabled:opacity-50 flex-shrink-0"
          >
            {loading === member.id ? "..." : "Message"}
          </button>
        </div>
      ))}
    </div>
  );
}

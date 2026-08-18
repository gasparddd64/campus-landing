"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BlockReportClient({
  userId,
  targetId,
  conversationId,
}: {
  userId: string;
  targetId: string;
  conversationId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  async function handleBlock() {
    if (!confirm("Block this user? They won't be able to see your content or message you.")) return;
    await supabase.from("blocks").insert({ blocker_id: userId, blocked_id: targetId });
    router.push("/messages");
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    await supabase.from("reports").insert({
      reporter_id: userId,
      target_type: "profile",
      target_id: targetId,
      reason: reportReason.trim(),
    });
    setReporting(false);
    setShowMenu(false);
    setReportReason("");
    alert("Report submitted. Thank you.");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((o) => !o)}
        className="text-gray-400 hover:text-gray-600 text-xl px-2"
        title="More options"
      >
        ⋯
      </button>

      {showMenu && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[180px]">
          <button
            onClick={() => {
              setShowMenu(false);
              handleBlock();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-t-xl"
          >
            Block user
          </button>
          <button
            onClick={() => {
              /* show report form inline */
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Report
          </button>
          <button
            onClick={() => setShowMenu(false)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 rounded-b-xl"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Report inline form */}
      {!showMenu && (
        <div className="hidden" id={`report-form-${conversationId}`}>
          <form onSubmit={handleReport} className="mt-2 space-y-2">
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={reporting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              {reporting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

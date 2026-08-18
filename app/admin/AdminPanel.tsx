"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  handled: boolean;
  created_at: string;
  reporter: { display_name: string } | null;
};

export default function AdminPanel({ reports }: { reports: ReportRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function doAction(action: string, reportId: string, targetId: string, targetType: string) {
    setLoading(reportId + action);
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reportId, targetId, targetType }),
    });
    if (!res.ok) {
      alert("Action failed");
    }
    setLoading(null);
    router.refresh();
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">✅</p>
        <p>No unhandled reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full capitalize">
                  {report.target_type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleString("en", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Reported by:{" "}
                <span className="font-medium">
                  {report.reporter?.display_name ?? "Unknown"}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Target ID:{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">
                  {report.target_id}
                </code>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Reason:</p>
            <p className="text-sm text-gray-700">{report.reason}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                doAction("hide_content", report.id, report.target_id, report.target_type)
              }
              disabled={!!loading}
              className="text-xs px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50"
            >
              {loading === report.id + "hide_content" ? "..." : "Hide content"}
            </button>
            <button
              onClick={() =>
                doAction("suspend_author", report.id, report.target_id, report.target_type)
              }
              disabled={!!loading}
              className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              {loading === report.id + "suspend_author" ? "..." : "Suspend author"}
            </button>
            <button
              onClick={() =>
                doAction("mark_handled", report.id, report.target_id, report.target_type)
              }
              disabled={!!loading}
              className="text-xs px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
            >
              {loading === report.id + "mark_handled" ? "..." : "Mark handled"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

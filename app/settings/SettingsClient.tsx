"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsClient({
  userId,
  email,
  displayName,
  digestOptIn,
}: {
  userId: string;
  email: string;
  displayName: string;
  digestOptIn: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [optIn, setOptIn] = useState(digestOptIn);
  const [savingDigest, setSavingDigest] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggleDigest() {
    setSavingDigest(true);
    const newVal = !optIn;
    setOptIn(newVal);
    await supabase
      .from("profiles")
      .update({ email_digest_opt_in: newVal })
      .eq("id", userId);
    setSavingDigest(false);
  }

  async function exportData() {
    setExporting(true);
    const [
      { data: profile },
      { data: listings },
      { data: posts },
      { data: messages },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("listings").select("*").eq("author_id", userId),
      supabase.from("posts").select("*").eq("author_id", userId),
      supabase.from("messages").select("*").eq("sender_id", userId),
    ]);

    const data = { profile, listings, posts, messages };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campus-landing-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function deleteAccount() {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action is permanent and cannot be undone."
      )
    )
      return;
    if (
      !confirm(
        "Final confirmation: all your data including listings, posts, and messages will be deleted."
      )
    )
      return;

    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      router.push("/");
    } else {
      alert("Failed to delete account. Please try again or contact support.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Account info */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Account</h2>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500">Display name</p>
            <p className="text-sm text-gray-900">{displayName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{email}</p>
          </div>
        </div>
      </div>

      {/* Digest */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Weekly digest email
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Receive a weekly summary of new listings, arrivals, and posts
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Sent every Tuesday at 9am</p>
          </div>
          <button
            onClick={toggleDigest}
            disabled={savingDigest}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              optIn ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                optIn ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Export your data
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Download all your data as a JSON file.
        </p>
        <button
          onClick={exportData}
          disabled={exporting}
          className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export data (JSON)"}
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-white border border-red-100 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-red-700 mb-1">
          Delete account
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
        <button
          onClick={deleteAccount}
          disabled={deleting}
          className="text-sm px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete my account"}
        </button>
      </div>
    </div>
  );
}

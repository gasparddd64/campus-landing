"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CloseListingButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleClose() {
    if (!confirm("Mark this listing as closed?")) return;
    setLoading(true);
    await supabase
      .from("listings")
      .update({ status: "closed" })
      .eq("id", listingId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? "Closing..." : "Mark as closed"}
    </button>
  );
}

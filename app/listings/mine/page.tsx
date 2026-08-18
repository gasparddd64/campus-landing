import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CloseListingButton from "./CloseListingButton";
import type { Listing } from "@/lib/types";

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/listings" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">My listings</h1>
          <div className="ml-auto">
            <Link
              href="/listings/new"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Post
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {(listings ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>You haven't posted any listings yet.</p>
            <Link
              href="/listings/new"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          (listings as Listing[]).map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {listing.type}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        listing.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {listing.status}
                    </span>
                    {listing.price != null && (
                      <span className="text-sm font-semibold text-green-700">
                        ${listing.price.toFixed(0)}/mo
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {listing.body}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {new Date(listing.created_at).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {listing.status === "active" && (
                  <CloseListingButton listingId={listing.id} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

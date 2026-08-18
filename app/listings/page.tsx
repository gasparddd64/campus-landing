import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Listing, ListingType } from "@/lib/types";

const LISTING_TYPES: { value: ListingType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "housing", label: "Housing" },
  { value: "sublet", label: "Sublet" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
];

const PAGE_SIZE = 20;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const params = await searchParams;
  const typeFilter = params.type as string | undefined;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (typeFilter && typeFilter !== ("all" as string)) {
    query = query.eq("type", typeFilter);
  }

  const { data: listings, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Listings</h1>
          <div className="flex gap-2">
            <Link
              href="/listings/mine"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              My listings
            </Link>
            <Link
              href="/listings/new"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Post
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {LISTING_TYPES.map((t) => {
            const isActive =
              t.value === "all" ? !typeFilter || typeFilter === "all" : typeFilter === t.value;
            return (
              <Link
                key={t.value}
                href={t.value === "all" ? "/listings" : `/listings?type=${t.value}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Listings */}
        <div className="space-y-3">
          {(listings ?? []).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No listings yet.</p>
              <Link
                href="/listings/new"
                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
              >
                Be the first to post
              </Link>
            </div>
          ) : (
            (listings as Listing[]).map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {listing.type}
                      </span>
                      {listing.price != null && (
                        <span className="text-sm font-semibold text-green-700">
                          ${listing.price.toFixed(0)}/mo
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {listing.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {listing.body}
                    </p>
                  </div>
                  {listing.photos.length > 0 && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.photos[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(listing.created_at).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 0 && (
              <Link
                href={`/listings?${typeFilter ? `type=${typeFilter}&` : ""}page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            {page < totalPages - 1 && (
              <Link
                href={`/listings?${typeFilter ? `type=${typeFilter}&` : ""}page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex justify-around py-2">
          <Link href="/home" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center py-1 text-blue-600">
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium">Listings</span>
          </Link>
          <Link href="/members" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">👥</span>
            <span className="text-xs">Members</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">💬</span>
            <span className="text-xs">Messages</span>
          </Link>
        </div>
      </nav>
      <div className="h-16" />
    </div>
  );
}

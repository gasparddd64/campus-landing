import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Listing } from "@/lib/types";

const ANTI_FRAUD_BANNER = (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
    <p className="font-semibold mb-1">⚠️ Safety reminder</p>
    <p>
      Never send a deposit or any payment before visiting the place in person or
      having someone you trust visit it. Never pay by wire transfer, gift card
      or crypto. If someone refuses a visit, it is a scam.
    </p>
  </div>
);

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { id } = await params;
  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(display_name, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const l = listing as Listing & {
    profiles: { display_name: string; avatar_url: string | null };
  };

  const showBanner = l.type === "housing" || l.type === "sublet";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/listings" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {l.title}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {showBanner && ANTI_FRAUD_BANNER}

        {/* Photos */}
        {l.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {l.photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-64 h-48 object-cover rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Main info */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                  {l.type}
                </span>
                {l.status === "closed" && (
                  <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    Closed
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{l.title}</h2>
            </div>
            {l.price != null && (
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">
                  ${l.price.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap">{l.body}</p>
        </div>

        {/* Author */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {l.profiles.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {l.profiles.display_name}
            </p>
            <p className="text-xs text-gray-500">
              Posted{" "}
              {new Date(l.created_at).toLocaleDateString("en", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Contact button */}
        {l.author_id !== user.id && (
          <button
            disabled
            title="Messaging coming soon"
            className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed"
          >
            Contact — Messaging coming soon
          </button>
        )}

        {l.author_id === user.id && (
          <Link
            href="/listings/mine"
            className="block text-center w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-300"
          >
            Manage your listings
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ListingType } from "@/lib/types";
import Link from "next/link";

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "housing", label: "Housing" },
  { value: "sublet", label: "Sublet" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
];

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

export default function NewListingForm({
  userId,
  campusId,
}: {
  userId: string;
  campusId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ListingType>("housing");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showBanner = type === "housing" || type === "sublet";

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 5) {
      setError("Maximum 5 photos allowed.");
      return;
    }
    setUploading(true);
    setError(null);

    const newPhotos: string[] = [];
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG and WebP images are allowed.");
        setUploading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each photo must be under 5MB.");
        setUploading(false);
        return;
      }
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, file);
      if (uploadError) {
        setError("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(path);
      newPhotos.push(urlData.publicUrl);
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.length < 3 || title.length > 120) {
      setError("Title must be between 3 and 120 characters.");
      return;
    }
    if (body.length < 10 || body.length > 4000) {
      setError("Description must be between 10 and 4000 characters.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("listings").insert({
      campus_id: campusId,
      author_id: userId,
      type,
      title,
      body,
      price: price ? parseFloat(price) : null,
      photos,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/listings");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/listings" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">New listing</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {showBanner && ANTI_FRAUD_BANNER}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ListingType)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show banner again after type change */}
        {showBanner && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ This category requires extra care — see the safety reminder above.
          </p>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-gray-400">({title.length}/120)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            maxLength={120}
            required
            placeholder="e.g. Furnished room near campus, available Aug 15"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description{" "}
            <span className="text-gray-400">({body.length}/4000)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minLength={10}
            maxLength={4000}
            required
            rows={6}
            placeholder="Describe what you're offering..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (optional, $/mo)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            placeholder="e.g. 800"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos (optional, max 5)
          </label>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((url, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-gray-300 disabled:opacity-50 w-full text-center"
              >
                {uploading ? "Uploading..." : "Click to add photos"}
              </button>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post listing"}
        </button>
      </form>
    </div>
  );
}

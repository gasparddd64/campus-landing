"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_LANGUAGES = [
  "English", "French", "Spanish", "Mandarin", "Arabic", "Hindi",
  "Portuguese", "German", "Japanese", "Korean", "Italian", "Russian",
  "Turkish", "Bengali", "Urdu", "Indonesian", "Vietnamese", "Persian",
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>([]);
  const [originCountry, setOriginCountry] = useState("");
  const [originVisible, setOriginVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const stored = JSON.parse(sessionStorage.getItem("onboarding") ?? "{}");
    const { campus_id, intake_month, intake_year, display_name, program } = stored;

    if (!campus_id || !display_name) {
      router.push("/onboarding");
      return;
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campus_id,
        intake_month,
        intake_year,
        display_name,
        program: program || null,
        languages,
        origin_country: originCountry || null,
        origin_country_visible: originVisible,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("onboarding");
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="h-1 flex-1 rounded-full bg-brand-500" />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Almost done</h1>
        <p className="text-gray-500 mb-8">
          These help others find people who speak their language.
          Everything here is optional.
        </p>

        <form onSubmit={handleFinish} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages you speak
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    languages.includes(lang)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country of origin{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="e.g. France"
              maxLength={60}
              className="input"
            />
            {originCountry && (
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={originVisible}
                  onChange={(e) => setOriginVisible(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-sm text-gray-600">
                  Show my country to other students in my campus
                </span>
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Setting up your space…" : "Join my cohort →"}
          </button>

          <button type="button" onClick={() => router.back()} className="btn-secondary w-full">
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

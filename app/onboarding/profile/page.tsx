"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep2() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [program, setProgram] = useState("");

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const existing = JSON.parse(sessionStorage.getItem("onboarding") ?? "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, display_name: displayName, program })
    );
    router.push("/onboarding/background");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${step <= 2 ? "bg-brand-500" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us a bit about you
        </h1>
        <p className="text-gray-500 mb-8">
          This is what other students in your cohort will see.
        </p>

        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex"
              required
              maxLength={50}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program / degree
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. MS Computer Science"
              maxLength={100}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-400">Optional</p>
          </div>

          <p className="text-sm text-gray-400 pt-1">
            Profile photo can be added later from your profile page.
          </p>

          <button
            type="submit"
            disabled={!displayName.trim()}
            className="btn-primary w-full"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary w-full"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

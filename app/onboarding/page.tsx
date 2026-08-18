"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Campus } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2025, 2026, 2027];

export default function OnboardingStep1() {
  const router = useRouter();
  const supabase = createClient();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusId, setCampusId] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("campuses")
      .select("*")
      .order("name")
      .then(({ data }) => setCampuses(data ?? []));
  }, [supabase]);

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!campusId) return;
    setLoading(true);

    // Store in sessionStorage for the next steps
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ campus_id: campusId, intake_month: month, intake_year: year })
    );
    router.push("/onboarding/profile");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${step === 1 ? "bg-brand-500" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Which campus are you joining?
        </h1>
        <p className="text-gray-500 mb-8">
          We&apos;ll connect you with students arriving the same month.
        </p>

        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              required
              className="input"
            >
              <option value="">Select your university…</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.city}, {c.state}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!campusId || loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

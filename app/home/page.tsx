import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, campus_id, campuses(name, city, state)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.campus_id) redirect("/onboarding");

  const { data: cohortMember } = await supabase
    .from("cohort_members")
    .select("cohorts(intake_month, intake_year)")
    .eq("profile_id", user.id)
    .maybeSingle();

  const cohort = cohortMember?.cohorts as
    | { intake_month: number; intake_year: number }
    | null;

  const monthName = cohort
    ? new Date(cohort.intake_year, cohort.intake_month - 1).toLocaleString(
        "en",
        { month: "long", year: "numeric" }
      )
    : null;

  const campus = profile.campuses as unknown as
    | { name: string; city: string; state: string }
    | null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {campus?.name}
            </p>
            <h1 className="font-semibold text-gray-900">
              {monthName ? `${monthName} cohort` : "Your cohort"}
            </h1>
          </div>
          <form action="/auth/signout" method="POST">
            <button className="text-sm text-gray-400 hover:text-gray-600">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Welcome */}
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {profile.display_name}!
        </h2>
        <p className="text-gray-500 mb-8">
          Your cohort space is ready.
          {monthName
            ? ` You're part of the ${monthName} intake at ${campus?.name}.`
            : ""}
        </p>

        <div className="card p-8 text-left space-y-4">
          <h3 className="font-semibold text-gray-900">Coming soon in your space</h3>
          <ul className="space-y-3">
            {[
              "📣  Cohort feed — ask questions, share tips",
              "🏠  Listings — housing, sublets, furniture",
              "👥  Members — find people who speak your language",
              "📬  Weekly digest — what you missed",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Logged in as {user.email}
        </p>
      </main>
    </div>
  );
}

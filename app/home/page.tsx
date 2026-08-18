import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FeedClient from "./FeedClient";

export type PostWithMeta = {
  id: string;
  cohort_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null };
  post_reactions: { profile_id: string }[];
  replies?: PostWithMeta[];
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, campus_id, campuses(name, city, state, slug)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.campus_id) redirect("/onboarding");

  const { data: cohortMember } = await supabase
    .from("cohort_members")
    .select("cohort_id, cohorts(intake_month, intake_year)")
    .eq("profile_id", user.id)
    .maybeSingle();

  const cohort = cohortMember?.cohorts as unknown as
    | { intake_month: number; intake_year: number }
    | null;

  const cohortId = cohortMember?.cohort_id ?? null;

  const monthName = cohort
    ? new Date(cohort.intake_year, cohort.intake_month - 1).toLocaleString(
        "en",
        { month: "long", year: "numeric" }
      )
    : null;

  const campus = profile.campuses as unknown as
    | { name: string; city: string; state: string; slug: string }
    | null;

  // Count new arrivals this month
  const now = new Date();
  const { count: newArrivals } = await supabase
    .from("cohort_members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId ?? "")
    .gte(
      "created_at",
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    );

  // Fetch initial posts
  let initialPosts: PostWithMeta[] = [];
  if (cohortId) {
    const { data: posts } = await supabase
      .from("posts")
      .select(
        "*, profiles(display_name, avatar_url), post_reactions(profile_id)"
      )
      .eq("cohort_id", cohortId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (posts) {
      for (const post of posts) {
        const { data: replies } = await supabase
          .from("posts")
          .select("*, profiles(display_name, avatar_url), post_reactions(profile_id)")
          .eq("parent_id", post.id)
          .order("created_at", { ascending: true });
        (post as PostWithMeta).replies = (replies ?? []) as PostWithMeta[];
      }
      initialPosts = posts as PostWithMeta[];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-20">
        {/* New arrivals encart */}
        {(newArrivals ?? 0) > 0 && campus?.slug && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                🎉 {newArrivals} new arrival
                {(newArrivals ?? 0) > 1 ? "s" : ""} this month
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Welcome to everyone joining!
              </p>
            </div>
            <Link
              href={`/guide/${campus.slug}`}
              className="text-xs text-blue-600 font-medium hover:underline flex-shrink-0 ml-4"
            >
              Campus guide →
            </Link>
          </div>
        )}

        {cohortId ? (
          <FeedClient
            cohortId={cohortId}
            userId={user.id}
            displayName={profile.display_name}
            initialPosts={initialPosts}
          />
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No cohort found. Please complete onboarding.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex justify-around py-2">
          <Link href="/home" className="flex flex-col items-center py-1 text-blue-600">
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">Feed</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">📋</span>
            <span className="text-xs">Listings</span>
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
    </div>
  );
}

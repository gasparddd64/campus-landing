import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartConversationButton from "./StartConversationButton";

const PAGE_SIZE = 20;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    language?: string;
    program?: string;
    page?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("campus_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!myProfile?.campus_id) redirect("/onboarding");

  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const langFilter = params.language ?? "";
  const programFilter = params.program ?? "";

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, program, bio, languages, origin_country, origin_country_visible",
      { count: "exact" }
    )
    .eq("campus_id", myProfile.campus_id)
    .neq("id", user.id)
    .order("display_name", { ascending: true })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (langFilter) {
    query = query.contains("languages", [langFilter]);
  }
  if (programFilter) {
    query = query.ilike("program", `%${programFilter}%`);
  }

  const { data: members, count } = await query;

  // Fetch my existing conversations
  const { data: convos } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);

  const convoMap = new Map<string, string>();
  for (const c of convos ?? []) {
    const other = c.participant_a === user.id ? c.participant_b : c.participant_a;
    convoMap.set(other, c.id);
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Members</h1>
          <p className="text-xs text-gray-400">{count ?? 0} on your campus</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <form className="bg-white border border-gray-100 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Language</label>
              <input
                type="text"
                name="language"
                defaultValue={langFilter}
                placeholder="e.g. French"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Program</label>
              <input
                type="text"
                name="program"
                defaultValue={programFilter}
                placeholder="e.g. MBA"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Filter
            </button>
            <Link
              href="/members"
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="space-y-2">
          {(members ?? []).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p>No members found with these filters.</p>
            </div>
          ) : (
            (members ?? []).map((member) => {
              const existingConvoId = convoMap.get(member.id);
              return (
                <div
                  key={member.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3"
                >
                  <Link
                    href={`/members/${member.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                      {member.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.display_name}
                      </p>
                      {member.program && (
                        <p className="text-xs text-gray-500 truncate">
                          {member.program}
                        </p>
                      )}
                      {member.languages && member.languages.length > 0 && (
                        <p className="text-xs text-gray-400">
                          {member.languages.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                  <StartConversationButton
                    userId={user.id}
                    targetId={member.id}
                    existingConvoId={existingConvoId}
                  />
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 0 && (
              <Link
                href={`/members?${new URLSearchParams({
                  ...(langFilter && { language: langFilter }),
                  ...(programFilter && { program: programFilter }),
                  page: String(page - 1),
                })}`}
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
                href={`/members?${new URLSearchParams({
                  ...(langFilter && { language: langFilter }),
                  ...(programFilter && { program: programFilter }),
                  page: String(page + 1),
                })}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex justify-around py-2">
          <Link href="/home" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Feed</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">📋</span>
            <span className="text-xs">Listings</span>
          </Link>
          <Link href="/members" className="flex flex-col items-center py-1 text-blue-600">
            <span className="text-xl">👥</span>
            <span className="text-xs font-medium">Members</span>
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

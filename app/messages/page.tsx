import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: convos } = await supabase
    .from("conversations")
    .select(
      "id, participant_a, participant_b, accepted, created_at, participant_a_profile:profiles!conversations_participant_a_fkey(display_name), participant_b_profile:profiles!conversations_participant_b_fkey(display_name)"
    )
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  type ConvoRow = {
    id: string;
    participant_a: string;
    participant_b: string;
    accepted: boolean;
    created_at: string;
    participant_a_profile: { display_name: string } | null;
    participant_b_profile: { display_name: string } | null;
  };

  const allConvos = ((convos ?? []) as unknown) as ConvoRow[];
  const accepted = allConvos.filter((c) => c.accepted);
  const requests = allConvos.filter((c) => !c.accepted);

  function otherName(c: ConvoRow): string {
    if (c.participant_a === user!.id) {
      return c.participant_b_profile?.display_name ?? "Unknown";
    }
    return c.participant_a_profile?.display_name ?? "Unknown";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        {/* Requests */}
        {requests.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Message Requests ({requests.length})
            </p>
            <div className="space-y-2">
              {requests.map((c) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 hover:border-amber-200"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold text-sm flex-shrink-0">
                    {otherName(c).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{otherName(c)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(c.created_at)}</p>
                  </div>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                    Request
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active messages */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Messages
          </p>
          {accepted.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-1">
                Message someone from the{" "}
                <Link href="/members" className="text-blue-600 hover:underline">
                  members page
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {accepted.map((c) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {otherName(c).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{otherName(c)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(c.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
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
          <Link href="/members" className="flex flex-col items-center py-1 text-gray-400 hover:text-gray-700">
            <span className="text-xl">👥</span>
            <span className="text-xs">Members</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-1 text-blue-600">
            <span className="text-xl">💬</span>
            <span className="text-xs font-medium">Messages</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

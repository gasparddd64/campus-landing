import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ContactButton from "./ContactButton";

export default async function MemberProfilePage({
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

  const { data: member } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, program, bio, languages, origin_country, origin_country_visible, campus_id")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  // Check if conversation exists
  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_a.eq.${user.id},participant_b.eq.${id}),and(participant_a.eq.${id},participant_b.eq.${user.id})`
    )
    .maybeSingle();

  const isOwnProfile = member.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/members" className="text-gray-500 hover:text-gray-700">
            ← Members
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Profile card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl mx-auto mb-4">
            {member.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{member.display_name}</h1>
          {member.program && (
            <p className="text-sm text-gray-500 mt-1">{member.program}</p>
          )}
          {member.origin_country && member.origin_country_visible && (
            <p className="text-sm text-gray-400 mt-1">From {member.origin_country}</p>
          )}
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          {member.bio && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                About
              </p>
              <p className="text-sm text-gray-700">{member.bio}</p>
            </div>
          )}
          {member.languages && member.languages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Languages
              </p>
              <div className="flex flex-wrap gap-1">
                {member.languages.map((lang: string) => (
                  <span
                    key={lang}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        {!isOwnProfile && (
          <ContactButton
            userId={user.id}
            targetId={id}
            existingConvoId={existingConvo?.id}
          />
        )}
      </div>
    </div>
  );
}

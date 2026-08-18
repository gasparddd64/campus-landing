import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MessageThread from "./MessageThread";

export default async function ConversationPage({
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

  const { data: convo } = await supabase
    .from("conversations")
    .select(
      "id, participant_a, participant_b, accepted, participant_a_profile:profiles!conversations_participant_a_fkey(display_name), participant_b_profile:profiles!conversations_participant_b_fkey(display_name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!convo) notFound();

  const isParticipant =
    convo.participant_a === user.id || convo.participant_b === user.id;
  if (!isParticipant) notFound();

  const otherProfile =
    convo.participant_a === user.id
      ? ((convo.participant_b_profile as unknown) as { display_name: string } | null)
      : ((convo.participant_a_profile as unknown) as { display_name: string } | null);

  const otherName = otherProfile?.display_name ?? "User";

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const isParticipantA = convo.participant_a === user.id;
  const isParticipantB = convo.participant_b === user.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/messages" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{otherName}</p>
            {!convo.accepted && (
              <p className="text-xs text-amber-600">Message request</p>
            )}
          </div>
          <div className="flex gap-2">
            <ReportBlockButtons
              userId={user.id}
              targetId={convo.participant_a === user.id ? convo.participant_b : convo.participant_a}
              conversationId={id}
            />
          </div>
        </div>
      </header>

      <MessageThread
        conversationId={id}
        userId={user.id}
        initialMessages={(messages ?? []) as Array<{
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        }>}
        accepted={convo.accepted}
        isParticipantA={isParticipantA}
        isParticipantB={isParticipantB}
        otherName={otherName}
      />
    </div>
  );
}

function ReportBlockButtons({
  userId,
  targetId,
  conversationId,
}: {
  userId: string;
  targetId: string;
  conversationId: string;
}) {
  return (
    <div className="flex gap-2">
      <BlockReportClient userId={userId} targetId={targetId} conversationId={conversationId} />
    </div>
  );
}

// Import inline to avoid extra file
import BlockReportClient from "./BlockReportClient";

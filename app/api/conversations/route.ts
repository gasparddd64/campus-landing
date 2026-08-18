import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { participant_b } = body;

  if (!participant_b) {
    return NextResponse.json({ error: "Missing participant_b" }, { status: 400 });
  }

  if (participant_b === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Check if conversation already exists (in either direction)
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_a.eq.${user.id},participant_b.eq.${participant_b}),and(participant_a.eq.${participant_b},participant_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_a: user.id,
      participant_b,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

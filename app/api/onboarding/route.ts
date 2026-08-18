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
  const {
    campus_id,
    intake_month,
    intake_year,
    display_name,
    program,
    languages,
    origin_country,
    origin_country_visible,
  } = body;

  if (!campus_id || !display_name || !intake_month || !intake_year) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upsert profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    campus_id,
    display_name,
    program: program || null,
    languages: languages ?? [],
    origin_country: origin_country || null,
    origin_country_visible: origin_country_visible ?? false,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Get or create cohort
  let cohortId: string | null = null;

  const { data: existing } = await supabase
    .from("cohorts")
    .select("id")
    .eq("campus_id", campus_id)
    .eq("intake_month", intake_month)
    .eq("intake_year", intake_year)
    .maybeSingle();

  if (existing) {
    cohortId = existing.id;
  } else {
    const { data: created, error: cohortError } = await supabase
      .from("cohorts")
      .insert({ campus_id, intake_month, intake_year })
      .select("id")
      .single();
    if (cohortError) {
      return NextResponse.json({ error: cohortError.message }, { status: 500 });
    }
    cohortId = created.id;
  }

  // Assign to cohort
  if (cohortId) {
    await supabase
      .from("cohort_members")
      .upsert({ profile_id: user.id, cohort_id: cohortId });
  }

  return NextResponse.json({ ok: true });
}

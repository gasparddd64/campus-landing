import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Admin client bypasses RLS — only used server-side, never exposed to browser
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  // Verify the user is authenticated via their session cookie
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

  const admin = getAdminClient();

  // Upsert profile (admin bypasses RLS, user identity verified above)
  const { error: profileError } = await admin.from("profiles").upsert({
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

  const { data: existing } = await admin
    .from("cohorts")
    .select("id")
    .eq("campus_id", campus_id)
    .eq("intake_month", intake_month)
    .eq("intake_year", intake_year)
    .maybeSingle();

  if (existing) {
    cohortId = existing.id;
  } else {
    const { data: created, error: cohortError } = await admin
      .from("cohorts")
      .insert({ campus_id, intake_month, intake_year })
      .select("id")
      .single();
    if (cohortError) {
      return NextResponse.json({ error: cohortError.message }, { status: 500 });
    }
    cohortId = created.id;
  }

  if (cohortId) {
    await admin
      .from("cohort_members")
      .upsert({ profile_id: user.id, cohort_id: cohortId });
  }

  return NextResponse.json({ ok: true });
}

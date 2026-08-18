import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/onboarding";

  const supabase = await createClient();

  // PKCE OAuth flow (GitHub, Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return afterAuth(supabase, origin, next);
  }

  // Magic link / email OTP flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return afterAuth(supabase, origin, next);
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}

async function afterAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  next: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(`${origin}/?error=auth`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("campus_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.campus_id) {
    return NextResponse.redirect(`${origin}/home`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

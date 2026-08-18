import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  // PKCE flow (OAuth or signInWithOtp from client)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return afterAuth(supabase, origin);
  }

  // Email OTP token_hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return afterAuth(supabase, origin);
  }

  // Implicit flow: access_token is in the URL hash — handled client-side
  // Redirect to the client handler page
  return NextResponse.redirect(`${origin}/auth/confirm`);
}

async function afterAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string
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

  return NextResponse.redirect(
    `${origin}${profile?.campus_id ? "/home" : "/onboarding"}`
  );
}

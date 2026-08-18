import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return new Response("Invalid link", { status: 400 });
  }

  const admin = getAdminClient();
  await admin
    .from("profiles")
    .update({ email_digest_opt_in: false })
    .eq("id", userId);

  return new Response(
    `<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h1>Unsubscribed</h1><p>You've been unsubscribed from the weekly digest. You can re-enable it anytime in your <a href="/settings">settings</a>.</p></body></html>`,
    { headers: { "content-type": "text/html" } }
  );
}

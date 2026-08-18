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
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "resend_placeholder") {
    return NextResponse.json(
      { skipped: true, reason: "RESEND_API_KEY not configured" },
      { status: 200 }
    );
  }

  const admin = getAdminClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, campus_id, email_digest_opt_in")
    .eq("email_digest_opt_in", true)
    .eq("suspended", false);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  for (const u of authUsers?.users ?? []) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  let sent = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://campus-landing-two.vercel.app";

  for (const profile of profiles) {
    const email = emailMap.get(profile.id);
    if (!email) continue;

    const { data: newListings } = await admin
      .from("listings")
      .select("title, type, price")
      .eq("campus_id", profile.campus_id)
      .eq("status", "active")
      .gte("created_at", oneWeekAgo)
      .order("created_at", { ascending: false })
      .limit(5);

    const { count: newArrivals } = await admin
      .from("cohort_members")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo);

    const { data: unansweredPosts } = await admin
      .from("posts")
      .select("body")
      .is("parent_id", null)
      .gte("created_at", oneWeekAgo)
      .limit(3);

    if (
      (!newListings || newListings.length === 0) &&
      (!newArrivals || newArrivals === 0) &&
      (!unansweredPosts || unansweredPosts.length === 0)
    ) {
      continue;
    }

    const listingsHtml =
      newListings && newListings.length > 0
        ? `<h3 style="margin:16px 0 8px">New listings this week</h3><ul style="padding-left:20px">${newListings
            .map((l: { title: string; type: string; price: number | null }) =>
              `<li>${l.title} (${l.type}${l.price ? `, $${l.price}/mo` : ""})</li>`
            )
            .join("")}</ul>`
        : "";

    const arrivalsHtml =
      newArrivals && newArrivals > 0
        ? `<p>👋 <strong>${newArrivals} new student${newArrivals > 1 ? "s" : ""}</strong> joined this week.</p>`
        : "";

    const postsHtml =
      unansweredPosts && unansweredPosts.length > 0
        ? `<h3 style="margin:16px 0 8px">Posts looking for replies</h3><ul style="padding-left:20px">${unansweredPosts
            .map((p: { body: string }) => `<li>${p.body.slice(0, 100)}${p.body.length > 100 ? "..." : ""}</li>`)
            .join("")}</ul>`
        : "";

    const unsubUrl = `${appUrl}/api/unsubscribe?userId=${profile.id}`;

    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
      <h1 style="font-size:20px">Your weekly Campus Landing digest</h1>
      <p>Hi ${profile.display_name}, here's what's new.</p>
      ${arrivalsHtml}${listingsHtml}${postsHtml}
      <div style="margin-top:32px"><a href="${appUrl}/home" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Open Campus Landing</a></div>
      <p style="margin-top:24px;font-size:12px;color:#999"><a href="${unsubUrl}" style="color:#999">Unsubscribe</a></p>
    </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Campus Landing <digest@campuslanding.app>",
        to: email,
        subject: "Your weekly Campus Landing digest",
        html,
      }),
    });

    sent++;
  }

  return NextResponse.json({ sent });
}

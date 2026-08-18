import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Service role used here — documented exception for /admin routes
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reportId, targetId, targetType } = (await request.json()) as {
    action: string;
    reportId: string;
    targetId: string;
    targetType: string;
  };

  const admin = getAdminClient();

  if (action === "hide_content") {
    if (targetType === "listing") {
      await admin.from("listings").update({ status: "closed" }).eq("id", targetId);
    } else if (targetType === "post") {
      await admin.from("posts").update({ hidden: true }).eq("id", targetId);
    }
    await admin.from("reports").update({ handled: true }).eq("id", reportId);
  } else if (action === "suspend_author") {
    // Find author from target
    if (targetType === "listing") {
      const { data: listing } = await admin
        .from("listings")
        .select("author_id")
        .eq("id", targetId)
        .single();
      if (listing) {
        await admin
          .from("profiles")
          .update({ suspended: true })
          .eq("id", listing.author_id);
      }
    } else if (targetType === "post") {
      const { data: post } = await admin
        .from("posts")
        .select("author_id")
        .eq("id", targetId)
        .single();
      if (post) {
        await admin
          .from("profiles")
          .update({ suspended: true })
          .eq("id", post.author_id);
      }
    } else if (targetType === "profile") {
      await admin.from("profiles").update({ suspended: true }).eq("id", targetId);
    }
    await admin.from("reports").update({ handled: true }).eq("id", reportId);
  } else if (action === "mark_handled") {
    await admin.from("reports").update({ handled: true }).eq("id", reportId);
  }

  return NextResponse.json({ ok: true });
}

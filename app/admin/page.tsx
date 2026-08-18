import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";

// Admin client uses service_role — only server-side, only in /admin (documented exception)
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Verify admin server-side
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/home");

  const admin = getAdminClient();

  // Fetch unhandled reports with related content
  const { data: reports } = await admin
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(display_name)")
    .eq("handled", false)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-400">
            {(reports ?? []).length} unhandled reports
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <AdminPanel
          reports={(reports ?? []) as Array<{
            id: string;
            reporter_id: string;
            target_type: string;
            target_id: string;
            reason: string;
            handled: boolean;
            created_at: string;
            reporter: { display_name: string } | null;
          }>}
        />
      </div>
    </div>
  );
}

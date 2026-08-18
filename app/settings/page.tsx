import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email_digest_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/home" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <SettingsClient
          userId={user.id}
          email={user.email ?? ""}
          displayName={profile?.display_name ?? ""}
          digestOptIn={profile?.email_digest_opt_in ?? true}
        />
      </div>
    </div>
  );
}

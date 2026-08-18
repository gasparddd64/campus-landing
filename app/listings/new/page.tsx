import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewListingForm from "./NewListingForm";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("campus_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.campus_id) redirect("/onboarding");

  return <NewListingForm userId={user.id} campusId={profile.campus_id} />;
}

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
  const { listing_id, index, content_type } = body;

  if (!listing_id || index === undefined || !content_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const path = `${user.id}/${listing_id}/${index}`;

  const { data, error } = await supabase.storage
    .from("listing-photos")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get the public URL after upload
  const { data: publicUrlData } = supabase.storage
    .from("listing-photos")
    .getPublicUrl(path);

  return NextResponse.json({
    signed_url: data.signedUrl,
    token: data.token,
    path,
    public_url: publicUrlData.publicUrl,
  });
}

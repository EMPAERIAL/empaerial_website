import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase environment variables missing.");
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "").trim();

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const extension = file.name?.split(".").pop() || "bin";
    const filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { contentType: file.type || undefined });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

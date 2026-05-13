import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_DELETE_PASSWORD || "Empaerial123";

const supabase = createClient(url, serviceKey || anonKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from("Blogs").select("*");
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      title, 
      slug, 
      author, 
      image_url, 
      content, 
      video_url, 
      graph_data, 
      gallery_images 
    } = body;

    const { data, error } = await supabase
      .from("Blogs")
      .insert([
        {
          title,
          slug,
          author,
          image_url,
          content,
          video_url: video_url || null,
          graph_data: graph_data || null,
          gallery_images: gallery_images || [], // ✅ new field
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("❌ POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id)
      return NextResponse.json({ error: "Missing blog ID" }, { status: 400 });

    const updates = {
      title: body.title,
      slug: body.slug,
      author: body.author,
      image_url: body.image_url,
      content: body.content,
      video_url: body.video_url ?? null,
      graph_data: body.graph_data ?? null,
      gallery_images: body.gallery_images ?? [],
    };

    const { data, error } = await supabase
      .from("Blogs")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("❌ PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id, password } = await req.json();
    if (password !== ADMIN_PASSWORD)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const { error } = await supabase.from("Blogs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

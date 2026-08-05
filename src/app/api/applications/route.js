// app/api/applications/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TABLE_NAMES = ["Applications", "applications"];

const DEPARTMENTS = ["software", "electronics", "mechanical", "coordination"];

const LIMITS = {
  full_name: 120,
  email: 160,
  phone: 40,
  country: 80,
  university: 160,
  skills: 400,
  portfolio_url: 300,
  motivation: 2000,
};

function getClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase environment variables missing.");
  }

  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function clean(value, max) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

// Validate + normalise the incoming body → DB row
function inRow(body) {
  const row = {
    full_name: clean(body.fullName ?? body.full_name, LIMITS.full_name),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    phone: clean(body.phone, LIMITS.phone),
    country: clean(body.country, LIMITS.country),
    university: clean(body.university, LIMITS.university),
    department: clean(body.department, 40).toLowerCase(),
    skills: clean(body.skills, LIMITS.skills),
    portfolio_url: clean(
      body.portfolio ?? body.portfolio_url,
      LIMITS.portfolio_url
    ),
    motivation: clean(body.motivation, LIMITS.motivation),
  };

  const errors = [];
  if (!row.full_name) errors.push("full name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push("email");
  if (!DEPARTMENTS.includes(row.department)) errors.push("department");
  if (!row.motivation) errors.push("motivation");

  return { row, errors };
}

// Try both Applications / applications
async function withTable(actionFn) {
  const supabase = getClient();
  let lastError = null;

  for (const table of TABLE_NAMES) {
    try {
      const result = await actionFn(supabase, table);
      if (result?.ok) return result;
      if (result?.error) lastError = result.error;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Applications table not found");
}

/* ============================================================
   POST /api/applications — public application submission
============================================================ */
export async function POST(req) {
  try {
    const body = await req.json();
    const { row, errors } = inRow(body);

    if (errors.length) {
      return NextResponse.json(
        { error: `Invalid or missing fields: ${errors.join(", ")}.` },
        { status: 400 }
      );
    }

    await withTable(async (supabase, table) => {
      const { error } = await supabase.from(table).insert(row);
      if (error) return { error };
      return { ok: true };
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Application submit error:", e?.message || e);
    return NextResponse.json(
      { error: "We could not record your application. Please try again." },
      { status: 500 }
    );
  }
}

/* ============================================================
   GET /api/applications — admin listing (password protected)
============================================================ */
export async function GET(req) {
  try {
    const password = new URL(req.url).searchParams.get("password");

    if (
      !process.env.ADMIN_PASSWORD ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { result } = await withTable(async (supabase, table) => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("id", { ascending: false });

      if (error) return { error };
      return { ok: true, result: data };
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e.message || String(e) },
      { status: 500 }
    );
  }
}

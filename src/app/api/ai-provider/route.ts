// src/app/api/ai-provider/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { AIProvider } from "@/lib/aiProviders";

const VALID_PROVIDERS: AIProvider[] = ["groq", "gemini"];

// GET: lay preferred_provider cua user tu Supabase
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ provider: "groq" });
  }

  const { data } = await supabase
    .from("user_settings")
    .select("preferred_provider")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ provider: data?.preferred_provider ?? "groq" });
}

// PUT: cap nhat preferred_provider cua user len Supabase
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chua dang nhap." }, { status: 401 });
  }

  const { provider } = await req.json();

  if (!VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Provider khong hop le." }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: user.id, preferred_provider: provider },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ error: "Khong cap nhat duoc." }, { status: 500 });
  }

  return NextResponse.json({ success: true, provider });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

// GET /api/documents — list with filters
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const topicId = searchParams.get("topic_id");
  const categoryId = searchParams.get("category_id");
  const difficulty = searchParams.get("difficulty");
  const fileType = searchParams.get("file_type");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("documents")
    .select(`
      id, title, file_name, file_type, difficulty, is_public, created_at,
      topic_id, category_id,
      topics:topic_id(name),
      categories:category_id(name)
    `, { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike("title", `%${search}%`);
  if (topicId) query = query.eq("topic_id", topicId);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (fileType) query = query.eq("file_type", fileType);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    documents: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

// POST /api/documents — save document metadata after file upload
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rate = checkRateLimit(user.id, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { title, file_name, file_type, file_path, topic_id, category_id, difficulty } = body;

  if (!title || !file_name || !file_type || !file_path) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
  }

  // Generate a signed URL to store as the permanent reference
  const { data: signedData, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUrl(file_path, 60 * 60 * 24 * 365); // 1 year

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: "Không thể tạo URL cho file." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      file_url: file_path, // store path, not signed URL (signs expire)
      file_name,
      file_type,
      topic_id: topic_id || null,
      category_id: category_id || null,
      difficulty: difficulty || null,
      is_public: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

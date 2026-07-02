import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/documents/[id]/signed-url — generate a short-lived signed download URL
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  // Fetch document record to get file path
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("file_url, file_name, is_public")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Tài liệu không tồn tại." }, { status: 404 });
  }

  if (!doc.is_public) {
    return NextResponse.json({ error: "Bạn không có quyền truy cập tài liệu này." }, { status: 403 });
  }

  // Generate signed URL valid for 1 hour
  const { data: signed, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_url, 3600, {
      download: doc.file_name,
    });

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Không thể tạo link tải." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl });
}

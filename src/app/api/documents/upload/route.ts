import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

// POST /api/documents/upload — upload file to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const rate = checkRateLimit(user.id, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: "Thiếu thông tin file." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: "Chỉ hỗ trợ file PDF và DOCX." }, { status: 400 });
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json({ error: "File quá lớn. Tối đa 20MB." }, { status: 400 });
    }

    const ext = fileType === "application/pdf" ? "pdf" : "docx";
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${safeFileName}`;

    console.log(`[Upload API] Tạo signed upload URL cho file: ${filePath}...`);
    
    // Generate signed upload URL from Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadData) {
      console.error(`[Upload API] Lỗi tạo signed URL:`, uploadError);
      return NextResponse.json({ error: `Lỗi kết nối Supabase Storage: ${uploadError?.message}` }, { status: 500 });
    }

    console.log(`[Upload API] Tạo signed URL thành công!`);

    return NextResponse.json({
      signedUrl: uploadData.signedUrl,
      token: uploadData.token, // Might be useful if we use uploadToSignedUrl
      filePath,
      fileName,
      fileType: ext,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    try {
      require('fs').writeFileSync('upload_error.txt', JSON.stringify({ message: error.message, stack: error.stack }, null, 2));
    } catch (e) {}
    return NextResponse.json({ error: `Lỗi (backend): ${error?.message || error}` }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { callAI, AIDisabledError } from "@/lib/aiClient";
import type { AIProvider } from "@/lib/aiProviders";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rate = checkRateLimit(user.id, 3, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

const { jdText, cvText, candidateName, recipientName, companyName, targetPosition, provider = "groq" } = await req.json();
  const aiProvider = provider as AIProvider;

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Job Description quá ngắn." }, { status: 400 });
  }

  const systemPrompt = `Bạn là một career coach chuyên giúp ứng viên IT viết email xin việc chuyên nghiệp, ấn tượng và phù hợp với từng vị trí cụ thể.

QUAN TRỌNG: Bạn cần sinh ra CẢ HAI phiên bản: Tiếng Việt (có dấu đầy đủ) và Tiếng Anh (chuẩn ngữ pháp, tự nhiên).
Nếu có "Vị trí ứng tuyển" được chỉ định rõ, email PHẢI ghi đúng tên vị trí đó trong tiêu đề và nội dung (không dùng tên chung chung của công ty/JD nếu JD có nhiều vị trí khác nhau).

Nguyên tắc viết email:
- Chủ đề (subject) ngắn gọn, hấp dẫn, đề cập vị trí và điểm nổi bật
- Mở đầu lịch sự, đề cập nguồn biết đến vị trí
- Thân email: nêu bật 2-3 điểm phù hợp nhất với JD, dùng số liệu cụ thể nếu có CV
- Kết thúc chuyên nghiệp với call-to-action rõ ràng
- Ký tên đầy đủ
- Độ dài vừa phải: không quá ngắn (<150 chữ) và không quá dài (>400 chữ)

Trả lời CHỈ bằng JSON theo đúng format sau:
{
  "subject": "tiêu đề email tiếng Việt",
  "body": "nội dung email tiếng Việt đầy đủ với xuống dòng bằng \\n",
  "alternativeSubjects": ["tiêu đề VN thay thế 1", "tiêu đề VN thay thế 2"],
  "subjectEn": "tiêu đề email tiếng Anh",
  "bodyEn": "nội dung email tiếng Anh đầy đủ với xuống dòng bằng \\n",
  "alternativeSubjectsEn": ["tiêu đề EN thay thế 1", "tiêu đề EN thay thế 2"],
  "tips": [
    "lời khuyên để cải thiện email này hoặc buổi phỏng vấn (tiếng Việt)"
  ]
}`;

   const userContent = [
    targetPosition?.trim() ? `Vị trí ứng tuyển: "${targetPosition.trim()}"` : "",
    `Job Description:\n${jdText}`,
    cvText ? `\nCV của ứng viên:\n${cvText}` : "",
    candidateName ? `\nTên ứng viên: ${candidateName}` : "",
    recipientName ? `\nTên người nhận: ${recipientName}` : "",
    companyName ? `\nTên công ty: ${companyName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000,
    });

    let parsed: any;
    try {
      const cleanContent = result.content.replace(/```(?:json)?\\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    return NextResponse.json({
      ...parsed,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI." }, { status: 500 });
  }
}
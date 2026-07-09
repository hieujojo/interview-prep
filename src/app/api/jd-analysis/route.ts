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

  const rate = checkRateLimit(user.id, 2, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const { jdText, provider = "groq", targetPosition } = await req.json();
  const aiProvider = provider as AIProvider;

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Job Description quá ngắn, hãy paste đầy đủ nội dung." },
      { status: 400 }
    );
  }

  // Validation: kiểm tra có phải JD không
  const checkResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Đây có phải là Job Description (JD) tuyển dụng không? Chỉ trả lời "yes" hoặc "no", không giải thích.\n\n${jdText.slice(0, 1000)}`,
        },
      ],
      temperature: 0,
      max_tokens: 5,
    }),
  });

  const checkData = await checkResponse.json();
  const checkAnswer = checkData.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "";

  if (!checkAnswer.includes("yes")) {
    return NextResponse.json(
      { error: "Nội dung không phải là Job Description. Vui lòng thử lại với file JD hợp lệ." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior technical recruiter kiêm engineer người Việt, đọc Job Description và phân tích sâu để chuẩn bị bộ câu hỏi phỏng vấn và thông tin hữu ích cho ứng viên.

QUAN TRỌNG: Toàn bộ phản hồi phải bằng tiếng Việt có đầy đủ dấu, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật (React, Node.js, Docker, v.v.).

Nguyên tắc phân tích:
- Nếu JD liệt kê NHIỀU vị trí tuyển dụng khác nhau (VD: nhiều role/team riêng biệt) và người dùng đã chỉ định vị trí cụ thể ở phần "Vị trí ứng tuyển", CHỈ phân tích tech stack, level, câu hỏi, bài tập, lộ trình học... dựa trên đúng phần JD của vị trí đó, bỏ qua hoàn toàn các vị trí không liên quan
- Nếu người dùng không chỉ định vị trí nhưng JD có nhiều vị trí, hãy chọn vị trí có nội dung mô tả kỹ nhất/gần đầu JD nhất và ghi rõ trong "levelReason" rằng JD có nhiều vị trí, đã chọn vị trí nào
- Tập trung vào những gì JD NHẤN MẠNH, không sinh câu hỏi chung chung
- Nếu JD đề cập 1 công nghệ nhiều lần ở vị trí quan trọng → câu hỏi về công nghệ đó phải chiếm tỉ lệ cao hơn
- Câu hỏi behavioral dựa vào phần culture values của JD nếu có
- Mỗi câu hỏi phải có độ khó: Cơ bản, Trung bình, hoặc Nâng cao
- Sinh 15-20 câu hỏi tổng, chia 3 category: Technical, System Design, Behavioral
- Sinh 2-3 bài tập coding mini phù hợp với stack trong JD

Phân tích công ty:
- Trích xuất tên công ty nếu có trong JD
- Phân tích văn hóa, môi trường làm việc dựa vào ngôn ngữ JD sử dụng
- Ước tính mức lương dựa vào level và tech stack (ghi rõ là ước tính)
- Nhận xét về sự ổn định, hướng phát triển của công ty nếu có thông tin

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác, không markdown:
{
  "techStack": ["công nghệ 1", "công nghệ 2"],
  "level": "Junior",
  "levelReason": "lý do ước tính level bằng tiếng Việt có dấu",
  "focusSkills": ["kỹ năng 1", "kỹ năng 2"],
  "companyName": "tên công ty hoặc null nếu không có",
  "companyAnalysis": {
    "culture": "mô tả văn hóa công ty bằng tiếng Việt có dấu",
    "environment": "môi trường làm việc",
    "techMaturity": "mức độ trưởng thành về kỹ thuật: Startup / Scale-up / Enterprise",
    "workStyle": "Remote / Hybrid / On-site",
    "pros": ["ưu điểm 1", "ưu điểm 2"],
    "cons": ["nhược điểm cần lưu ý 1"]
  },
  "salaryRange": {
    "min": 1000,
    "max": 2500,
    "currency": "USD",
    "note": "Ước tính dựa theo level và tech stack, thị trường Việt Nam"
  },
  "learningRoadmap": [
    { "priority": "Cao", "skill": "tên kỹ năng", "reason": "lý do cần học bằng tiếng Việt" }
  ],
  "questions": [
    { "category": "Technical", "difficulty": "Cơ bản", "content": "nội dung câu hỏi bằng tiếng Việt có dấu" }
  ],
  "exercises": [
    { "title": "tên bài tập", "description": "mô tả ngắn gọn bằng tiếng Việt", "language": "ngôn ngữ gợi ý" }
  ]
}`;

  try {
    const result = await callAI({
      provider: aiProvider,
       messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            (targetPosition && targetPosition.trim()
              ? `Vị trí ứng tuyển: "${targetPosition.trim()}"\n\n`
              : "") + "Job Description:\n\n" + jdText,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2500,
    });

    let parsed: any;
    try {
      const cleanContent = result.content.replace(/```(?:json)?\\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    const { data: saved, error: saveError } = await supabase
      .from("jd_analyses")
      .insert({
        user_id: user.id,
        jd_text: jdText,
        tech_stack: parsed.techStack ?? [],
        level: parsed.level ?? null,
        questions_json: {
          levelReason: parsed.levelReason,
          focusSkills: parsed.focusSkills,
          companyName: parsed.companyName,
          companyAnalysis: parsed.companyAnalysis,
          salaryRange: parsed.salaryRange,
          learningRoadmap: parsed.learningRoadmap,
          questions: parsed.questions,
          exercises: parsed.exercises,
        },
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Lỗi lưu jd_analyses:", JSON.stringify(saveError, null, 2));
    }

    return NextResponse.json({
      ...parsed,
      savedId: saved?.id ?? null,
      _meta: { usedProvider: result.usedProvider, didFallback: result.didFallback },
    });
  } catch (err) {
    if (err instanceof AIDisabledError) {
      return NextResponse.json({ error: "AI_DISABLED" }, { status: 503 });
    }
    return NextResponse.json({ error: "Lỗi kết nối AI." }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(null);
  }

  const { data, error } = await supabase
    .from("jd_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    jdText: data.jd_text,
    techStack: data.tech_stack,
    level: data.level,
    ...data.questions_json,
    savedId: data.id,
  });
}
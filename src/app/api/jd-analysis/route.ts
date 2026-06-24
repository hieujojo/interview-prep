import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { jdText } = await req.json();

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Job Description quá ngắn, hãy paste đầy đủ nội dung." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior technical recruiter kiêm engineer người Việt, đọc Job Description và phân tích sâu để chuẩn bị bộ câu hỏi phỏng vấn và thông tin hữu ích cho ứng viên.

QUAN TRỌNG: Toàn bộ phản hồi phải bằng tiếng Việt có đầy đủ dấu, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật (React, Node.js, Docker, v.v.).

Nguyên tắc phân tích:
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

  const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Job Description:\n\n" + jdText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 5000,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return NextResponse.json({ error: "AI API lỗi: " + errText }, { status: 500 });
  }

  const aiData = await aiResponse.json();
  const rawText = aiData.choices?.[0]?.message?.content ?? "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("jd_analyses")
    .insert({
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
  } else {
    console.log("Lưu thành công jd_analyses id:", saved?.id);
  }

  return NextResponse.json({ ...parsed, savedId: saved?.id ?? null });
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { cvText } = await req.json();

  if (!cvText || cvText.trim().length < 100) {
    return NextResponse.json(
      { error: "CV quá ngắn, hãy paste đầy đủ nội dung CV." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior technical recruiter và career coach người Việt, có nhiệm vụ phân tích CV của ứng viên công nghệ một cách chi tiết và thực tế.

QUAN TRỌNG: Toàn bộ phản hồi phải bằng tiếng Việt có đầy đủ dấu, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật (React, Node.js, Docker, v.v.).

Nhiệm vụ:
1. Trích xuất thông tin từ CV (kỹ năng, kinh nghiệm, dự án, học vấn)
2. Đánh giá điểm mạnh và điểm yếu thực tế
3. Gợi ý những kỹ năng/kiến thức nên học thêm dựa theo CV hiện tại
4. Sinh câu hỏi phỏng vấn dựa TRỰC TIẾP vào nội dung CV (hỏi về skill, project, experience cụ thể trong CV)

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác:
{
  "name": "tên ứng viên hoặc null",
  "currentLevel": "Junior / Mid / Senior",
  "levelReason": "lý do ước tính level bằng tiếng Việt có dấu",
  "skills": {
    "technical": ["kỹ năng kỹ thuật 1", "kỹ năng kỹ thuật 2"],
    "soft": ["kỹ năng mềm 1", "kỹ năng mềm 2"],
    "tools": ["công cụ 1", "công cụ 2"]
  },
  "experience": [
    {
      "company": "tên công ty",
      "role": "chức vụ",
      "duration": "thời gian",
      "highlights": ["điểm nổi bật 1", "điểm nổi bật 2"]
    }
  ],
  "projects": [
    {
      "name": "tên dự án",
      "tech": ["công nghệ sử dụng"],
      "description": "mô tả ngắn bằng tiếng Việt",
      "impact": "tác động/kết quả"
    }
  ],
  "education": {
    "degree": "bằng cấp",
    "major": "chuyên ngành",
    "school": "trường",
    "year": "năm tốt nghiệp"
  },
  "strengths": [
    { "title": "điểm mạnh", "description": "giải thích chi tiết bằng tiếng Việt có dấu" }
  ],
  "weaknesses": [
    { "title": "điểm yếu/thiếu sót", "description": "giải thích và gợi ý cải thiện bằng tiếng Việt có dấu" }
  ],
  "learningRecommendations": [
    {
      "skill": "kỹ năng nên học",
      "reason": "lý do tại sao cần học bằng tiếng Việt có dấu",
      "priority": "Cao / Trung bình / Thấp",
      "resources": ["gợi ý tài nguyên học cụ thể"]
    }
  ],
  "interviewQuestions": [
    {
      "category": "Skill / Project / Experience / Behavioral",
      "difficulty": "Cơ bản / Trung bình / Nâng cao",
      "content": "câu hỏi cụ thể dựa vào CV, ví dụ: Trong dự án X bạn đã xử lý vấn đề Y như thế nào?",
      "context": "nội dung trong CV liên quan đến câu hỏi này"
    }
  ],
  "overallScore": {
    "score": 75,
    "breakdown": {
      "technicalDepth": 70,
      "projectImpact": 80,
      "experience": 75,
      "presentation": 65
    },
    "summary": "nhận xét tổng thể bằng tiếng Việt có dấu"
  }
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
        { role: "user", content: "CV của ứng viên:\n\n" + cvText },
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

  // Lưu vào Supabase (optional - không block nếu lỗi)
  try {
    await supabase.from("cv_analyses").insert({
      cv_text: cvText,
      skills: parsed.skills ?? {},
      experience: parsed.experience ?? [],
      projects: parsed.projects ?? [],
      education: parsed.education ?? null,
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      learning_recommendations: parsed.learningRecommendations ?? [],
      interview_questions: parsed.interviewQuestions ?? [],
    });
  } catch {
    console.warn("Bỏ qua lỗi lưu cv_analyses (bảng chưa tồn tại)");
  }

  return NextResponse.json(parsed);
}

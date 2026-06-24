import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { cvText, jdText } = await req.json();

  if (!cvText || cvText.trim().length < 50) {
    return NextResponse.json({ error: "CV quá ngắn." }, { status: 400 });
  }
  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Job Description quá ngắn." }, { status: 400 });
  }

  const systemPrompt = `Bạn là một expert technical recruiter người Việt, nhiệm vụ là so sánh CV của ứng viên với Job Description và đưa ra đánh giá chi tiết về mức độ phù hợp.

QUAN TRỌNG: Toàn bộ phản hồi phải bằng tiếng Việt có đầy đủ dấu, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật.

Trả lời CHỈ bằng JSON theo đúng format sau:
{
  "matchScore": 75,
  "verdict": "Phù hợp tốt / Phù hợp một phần / Chưa phù hợp",
  "verdictReason": "lý do ngắn gọn bằng tiếng Việt có dấu",
  "matchedSkills": [
    { "skill": "tên kỹ năng", "level": "mức độ trong CV", "required": "yêu cầu trong JD" }
  ],
  "missingSkills": [
    { "skill": "kỹ năng thiếu", "importance": "Bắt buộc / Quan trọng / Tốt nếu có", "description": "mô tả tại sao cần" }
  ],
  "surplusSkills": ["kỹ năng ứng viên có nhưng JD không yêu cầu"],
  "experienceMatch": {
    "required": "kinh nghiệm JD yêu cầu",
    "candidate": "kinh nghiệm ứng viên có",
    "gap": "khoảng cách nếu có, null nếu đủ"
  },
  "suggestions": [
    {
      "area": "lĩnh vực cần cải thiện",
      "action": "hành động cụ thể cần làm",
      "timeline": "thời gian dự kiến",
      "priority": "Cao / Trung bình / Thấp"
    }
  ],
  "learningPath": [
    {
      "skill": "kỹ năng cần học",
      "why": "lý do liên quan đến JD này",
      "howToLearn": "cách học cụ thể (khóa học, dự án, v.v.)",
      "estimatedTime": "thời gian ước tính"
    }
  ],
  "interviewReadiness": {
    "score": 70,
    "strongPoints": ["điểm có thể tự tin khi phỏng vấn"],
    "weakPoints": ["điểm cần chuẩn bị thêm trước phỏng vấn"],
    "tips": ["lời khuyên cụ thể cho buổi phỏng vấn"]
  },
  "coverLetterHints": ["điểm nổi bật nên nhấn mạnh trong thư xin việc"]
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
        {
          role: "user",
          content: `CV của ứng viên:\n\n${cvText}\n\n---\n\nJob Description:\n\n${jdText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
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

  return NextResponse.json(parsed);
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { callAI, AIDisabledError, extractJson } from "@/lib/aiClient";
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

  const { cvText, provider = "groq" } = await req.json();
  const aiProvider = provider as AIProvider;

  if (!cvText || cvText.trim().length < 100) {
    return NextResponse.json(
      { error: "CV quá ngắn, hãy paste đầy đủ nội dung CV." },
      { status: 400 }
    );
  }

  const systemPrompt = `Bạn là một senior technical recruiter và career coach người Việt, chuyên đánh giá CV ứng viên công nghệ tại thị trường Việt Nam (TP.HCM, Hà Nội, Đà Nẵng).

QUAN TRỌNG: Toàn bộ phản hồi phải bằng tiếng Việt có đầy đủ dấu, chỉ giữ tiếng Anh cho thuật ngữ kỹ thuật (React, Node.js, Docker, v.v.).

===== THANG LEVEL THỊ TRƯỜNG VIỆT NAM =====

Có 5 level, tập trung phân biệt rõ 3 level đầu vì đây là nhóm phổ biến nhất:

1. **Intern** (Thực tập sinh)
   - Đang học hoặc vừa tốt nghiệp, chưa có kinh nghiệm thực tế
   - Có thể có 1–2 project cá nhân hoặc đồ án
   - Chưa đi làm chính thức, hoặc chỉ có internship dưới 3 tháng
   - Kỹ năng còn hạn chế, cần được hướng dẫn chặt chẽ
   - Lương: 2–5 triệu/tháng (hoặc không lương)

2. **Fresher** (Mới đi làm, 0–1 năm)
   - Tốt nghiệp rồi, có thể đã đi làm < 1 năm
   - Có project thực tế hoặc internship có ý nghĩa
   - Hiểu được cơ bản về quy trình làm việc (Git, deploy, review code)
   - Cần mentor nhưng đã có thể làm task nhỏ độc lập
   - Lương: 7–15 triệu/tháng (tùy stack và công ty)

3. **Junior** (1–2 năm kinh nghiệm)
   - Đã đi làm thực tế 1–2 năm tại công ty
   - Làm việc được độc lập trong phạm vi task được assign
   - Hiểu rõ ít nhất 1 stack (FE hoặc BE hoặc Mobile)
   - Biết debug, đọc code người khác, tham gia code review cơ bản
   - Lương: 15–25 triệu/tháng

4. **Middle** (2–4 năm, tự chủ cao)
   - Tự thiết kế giải pháp cho feature trung bình
   - Có thể mentor fresher/junior
   - Hiểu system ở mức module, biết trade-off kỹ thuật
   - Lương: 25–45 triệu/tháng

5. **Senior** (4+ năm, dẫn dắt kỹ thuật)
   - Thiết kế hệ thống, kiến trúc
   - Dẫn dắt team, làm việc với stakeholder
   - Có track record dự án lớn, impact rõ ràng
   - Lương: 45–80+ triệu/tháng

===== NGUYÊN TẮC PHÂN TÍCH =====

PHÂN TÍCH NGỮ CẢNH — đọc kỹ CV để hiểu:
- Ứng viên đang ở đâu trong hành trình sự nghiệp (sinh viên / mới ra trường / đang đi làm)
- Các project là đồ án trường / personal project / sản phẩm thực tế cho công ty?
- Kỹ năng được liệt kê có bằng chứng thực tế (project, công việc) hay chỉ học lý thuyết?
- Thời gian kinh nghiệm có liên tục không, hay có gap?

TIN HIỆU NHẬN BIẾT LEVEL:
- Intern: từ khoá "đồ án", "học phần", "thực tập", chưa có công ty nào
- Fresher: mới 1 công ty, thời gian ngắn, project nhỏ, còn nhiều "đang học"
- Junior: 1–2 công ty, task rõ ràng, có đóng góp đo được nhưng chưa lead
- Middle: lead feature, mentor người khác, có thiết kế kỹ thuật
- Senior: system design, team lead, impact lớn, nhiều công ty có tiếng

ĐÁNH GIÁ ĐIỂM SỐ theo chuẩn thị trường Việt Nam:
- technicalDepth: độ rộng và sâu stack, có chứng minh bằng code/project thực tế không
- projectImpact: project có user thực / doanh thu / scale không, hay chỉ là demo/học tập
- experience: số năm × chất lượng môi trường làm việc (startup outsource / product / MNC)
- presentation: CV có rõ ràng, dễ đọc, có số liệu cụ thể, không lỗi không?

SINH CÂU HỎI PHỎNG VẤN phải bám sát CV:
- Hỏi về project CỤ THỂ được đề cập trong CV
- Hỏi về công nghệ CỤ THỂ ứng viên đã dùng
- Câu Behavioral dựa vào tình huống thực tế trong CV
- KHÔNG hỏi câu hỏi chung chung kiểu "bạn mạnh về gì"
- Với Intern/Fresher: tập trung câu cơ bản, hỏi tư duy và tiềm năng
- Với Junior trở lên: hỏi sâu về kỹ thuật và cách giải quyết vấn đề thực tế

GỢI Ý HỌC THÊM phải thực tế với thị trường VN:
- Ưu tiên skill đang hot tại VN (Next.js, NestJS, Flutter, AWS, k8s...)
- Gợi ý tài nguyên tiếng Việt nếu có (F8, Fullstack.edu.vn, TopDev blog...)
- Nêu rõ vì sao skill đó quan trọng với mức level hiện tại

Trả lời CHỈ bằng JSON theo đúng format sau, không thêm text nào khác:
{
  "name": "tên ứng viên hoặc null",
  "currentLevel": "Intern / Fresher / Junior / Middle / Senior",
  "levelReason": "giải thích chi tiết vì sao xếp level này, dựa vào bằng chứng cụ thể trong CV",
  "levelConfidence": "Cao / Trung bình / Thấp",
  "levelNote": "lưu ý nếu CV có dấu hiệu gần lên level tiếp theo hoặc có điểm bất thường",
  "skills": {
    "technical": ["kỹ năng kỹ thuật 1"],
    "soft": ["kỹ năng mềm 1"],
    "tools": ["công cụ 1"]
  },
  "experience": [
    {
      "company": "tên công ty",
      "role": "chức vụ",
      "duration": "thời gian",
      "type": "Internship / Full-time / Freelance / Part-time",
      "highlights": ["điểm nổi bật cụ thể, có số liệu nếu có"]
    }
  ],
  "projects": [
    {
      "name": "tên dự án",
      "tech": ["công nghệ sử dụng"],
      "type": "Đồ án / Personal / Production",
      "description": "mô tả ngắn bằng tiếng Việt",
      "impact": "tác động/kết quả đo được, hoặc null nếu không có"
    }
  ],
  "education": {
    "degree": "bằng cấp",
    "major": "chuyên ngành",
    "school": "trường",
    "year": "năm tốt nghiệp hoặc dự kiến"
  },
  "strengths": [
    { "title": "điểm mạnh", "description": "bằng chứng cụ thể từ CV" }
  ],
  "weaknesses": [
    { "title": "điểm yếu/thiếu sót", "description": "nhận xét thực tế và gợi ý cải thiện cụ thể" }
  ],
  "learningRecommendations": [
    {
      "skill": "kỹ năng nên học",
      "reason": "lý do cụ thể phù hợp với level và thị trường VN",
      "priority": "Cao / Trung bình / Thấp",
      "resources": ["tài nguyên học cụ thể, ưu tiên tiếng Việt nếu có"]
    }
  ],
  "interviewQuestions": [
    {
      "category": "Skill / Project / Experience / Behavioral",
      "difficulty": "Cơ bản / Trung bình / Nâng cao",
      "content": "câu hỏi bám sát nội dung CV, không chung chung",
      "context": "trích dẫn phần CV liên quan dẫn đến câu hỏi này"
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
    "summary": "nhận xét tổng thể thực tế, thẳng thắn, có định hướng rõ ràng cho ứng viên"
  }
}`;

  try {
    const result = await callAI({
      provider: aiProvider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "CV của ứng viên:\n\n" + cvText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500,
    });

    let parsed: any;
    try {
      const cleanContent = extractJson(result.content);
      console.log('--- [CV ANALYSIS] AI RAW RESPONSE ---', result.content);
      console.log('--- [CV ANALYSIS] CLEANED CONTENT ---', cleanContent);
      parsed = JSON.parse(cleanContent);
    } catch (err) {
      console.error('[CV ANALYSIS] Parse error:', err);
      return NextResponse.json({ error: "Không parse được phản hồi AI." }, { status: 500 });
    }

    try {
      await supabase.from("cv_analyses").insert({
        user_id: user.id,
        cv_text: cvText,
        skills: parsed.skills ?? {},
        experience: parsed.experience ?? [],
        projects: parsed.projects ?? [],
        education: parsed.education ?? null,
        strengths: parsed.strengths ?? [],
        weaknesses: parsed.weaknesses ?? [],
        learning_recommendations: parsed.learningRecommendations ?? [],
        interview_questions: parsed.interviewQuestions ?? [],
        overall_score: parsed.overallScore ?? null,
        name: parsed.name ?? null,
        current_level: parsed.currentLevel ?? null,
        level_reason: parsed.levelReason ?? null,
      });
    } catch {
      console.warn("Bỏ qua lỗi lưu cv_analyses");
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

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(null);
  }

  const { data, error } = await supabase
    .from("cv_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    cvText: data.cv_text,
    skills: data.skills,
    experience: data.experience,
    projects: data.projects,
    education: data.education,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    learningRecommendations: data.learning_recommendations,
    interviewQuestions: data.interview_questions,
    overallScore: data.overall_score || {
      score: 0,
      breakdown: { technicalDepth: 0, projectImpact: 0, experience: 0, presentation: 0 },
      summary: "",
    },
    name: data.name || null,
    currentLevel: data.current_level || "Fresher",
    levelReason: data.level_reason || "",
  });
}
// Bảng `notes` duy nhất — gộp session notes + manual notes
export interface Note {
  id: string;
  user_id: string;
  session_id: string | null;
  source: 'session' | 'manual';   // 'session' = ghi chú phỏng vấn, 'manual' = ghi chú học tập
  title: string | null;
  content: string | null;
  tags: string[];
  question_index: number | null;
  question_content: string | null;
  note_text: string | null;
  created_at: string;
  updated_at: string;
}

// Payload tạo ghi chú học tập thủ công
export interface CreateManualNotePayload {
  title: string;
  content: string;
  tags: string[];
}

// Payload ghi chú trong phiên phỏng vấn (dùng nội bộ)
export interface CreateSessionNotePayload {
  session_id: string | null;
  question_index: number;
  question_content: string;
  note_text: string;
  title?: string;
}

// Dùng trong lúc phỏng vấn (chưa lưu DB)
export interface InProgressNote {
  questionIndex: number;
  questionContent: string;
  noteText: string;
}
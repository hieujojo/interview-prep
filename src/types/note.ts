export interface SessionNote {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string;
  created_at: string;
  items?: SessionNoteItem[];
}

export interface SessionNoteItem {
  id: string;
  session_note_id: string;
  question_content: string;
  note_text: string;
  question_index: number;
  created_at: string;
}

// Dùng trong lúc phỏng vấn (chưa lưu DB)
export interface InProgressNote {
  questionIndex: number;
  questionContent: string;
  noteText: string;
}

export interface LearningNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tags?: string[];
}
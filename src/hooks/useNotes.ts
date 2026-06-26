import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Note, CreateManualNotePayload, CreateSessionNotePayload, InProgressNote } from '@/types/note';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error: err } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (err) setError(err.message);
    else setNotes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Tạo ghi chú học tập thủ công
  const createManualNote = async (payload: CreateManualNotePayload) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Chưa đăng nhập' };

    const { error: err } = await supabase.from('notes').insert({
      user_id: user.id,
      source: 'manual',
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
    });

    if (err) return { error: err.message };
    await fetchNotes();
    return { error: null };
  };

  // Cập nhật ghi chú học tập
  const updateManualNote = async (id: string, payload: CreateManualNotePayload) => {
    const { error: err } = await supabase
      .from('notes')
      .update({
        title: payload.title,
        content: payload.content,
        tags: payload.tags,
      })
      .eq('id', id);

    if (err) return { error: err.message };
    await fetchNotes();
    return { error: null };
  };

  // Lưu ghi chú từ phiên phỏng vấn (batch insert)
  const saveSessionNotes = async (
    inProgressNotes: InProgressNote[],
    sessionId: string | null,
    topicLabel: string
  ) => {
    const filled = inProgressNotes.filter(n => n.noteText.trim());
    if (filled.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notes').insert(
      filled.map(n => ({
        user_id: user.id,
        session_id: sessionId,
        source: 'session',
        title: topicLabel,
        question_index: n.questionIndex,
        question_content: n.questionContent,
        note_text: n.noteText,
        tags: [],
      }))
    );
  };

  // Xóa note (cả 2 loại)
  const deleteNote = async (id: string) => {
    const { error: err } = await supabase.from('notes').delete().eq('id', id);
    if (err) return { error: err.message };
    setNotes(prev => prev.filter(n => n.id !== id));
    return { error: null };
  };

  const manualNotes = notes.filter(n => n.source === 'manual');
  const sessionNotes = notes.filter(n => n.source === 'session');

  return {
    notes,
    manualNotes,
    sessionNotes,
    loading,
    error,
    createManualNote,
    updateManualNote,
    saveSessionNotes,
    deleteNote,
    refetch: fetchNotes,
  };
}
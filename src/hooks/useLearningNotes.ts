import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningNote, CreateNotePayload, UpdateNotePayload } from '@/types/note';

export function useLearningNotes() {
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('learning_notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setNotes(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (payload: CreateNotePayload) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Chưa đăng nhập' };

    const { error: err } = await supabase
      .from('learning_notes')
      .insert({ ...payload, user_id: user.id });

    if (err) return { error: err.message };
    await fetchNotes();
    return { error: null };
  };

  const updateNote = async (id: string, payload: UpdateNotePayload) => {
    const { error: err } = await supabase
      .from('learning_notes')
      .update(payload)
      .eq('id', id);

    if (err) return { error: err.message };
    await fetchNotes();
    return { error: null };
  };

  const deleteNote = async (id: string) => {
    const { error: err } = await supabase
      .from('learning_notes')
      .delete()
      .eq('id', id);

    if (err) return { error: err.message };
    setNotes(prev => prev.filter(n => n.id !== id));
    return { error: null };
  };

  return { notes, loading, error, createNote, updateNote, deleteNote, refetch: fetchNotes };
}
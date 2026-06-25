import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SessionNote, InProgressNote } from '@/types/note';

export function useSessionNotes() {
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSessionNotes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setSessionNotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSessionNotes(); }, []);

  const saveSessionNotes = async (
    notes: InProgressNote[],
    sessionId: string | null,
    topicLabel: string
  ) => {
    const filled = notes.filter(n => n.noteText.trim());
    if (filled.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('session_notes').insert(
      filled.map(n => ({
        user_id: user.id,
        session_id: sessionId,
        question_index: n.questionIndex,
        question_content: n.questionContent,
        note_text: n.noteText,
      }))
    );
  };

  const deleteSessionNote = async (id: string) => {
    await supabase.from('session_notes').delete().eq('id', id);
    setSessionNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleExpand = (id: string) =>
    setExpandedId(prev => prev === id ? null : id); 

  return {
    sessionNotes, loading,
    expandedId, toggleExpand,
    saveSessionNotes, deleteSessionNote,
    refetch: fetchSessionNotes
  };
}
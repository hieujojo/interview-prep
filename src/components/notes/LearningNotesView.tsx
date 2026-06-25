'use client';

import { useSessionNotes } from '@/hooks/useSessionNotes';
import { NoteSessionCard } from './NoteSessionCard';

export function LearningNotesView() {
  const { sessionNotes, loading, expandedId, toggleExpand, deleteSessionNote } = useSessionNotes();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-1">📓 Ghi chú học tập</h1>
        <p className="text-sm text-muted">
          Ghi chú được tự động lưu sau mỗi phiên phỏng vấn
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && sessionNotes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-foreground font-semibold mb-1">Chưa có ghi chú nào</p>
          <p className="text-sm text-muted">
            Bắt đầu phỏng vấn và ghi chú những gì bạn chưa biết nhé!
          </p>
        </div>
      )}

      {!loading && sessionNotes.length > 0 && (
        <div className="space-y-3">
          {sessionNotes.map(note => (
            <NoteSessionCard
              key={note.id}
              note={note}
              onDelete={deleteSessionNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
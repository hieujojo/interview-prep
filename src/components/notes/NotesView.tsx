'use client';

import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { Note, CreateManualNotePayload } from '@/types/note';

type Tab = 'all' | 'manual' | 'session';

export function NotesView() {
  const {
    manualNotes, sessionNotes, notes,
    loading, error,
    createManualNote, updateManualNote, deleteNote,
  } = useNotes();

  const [tab, setTab] = useState<Tab>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const displayed = tab === 'all' ? notes : tab === 'manual' ? manualNotes : sessionNotes;

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  const handleSubmit = async (payload: CreateManualNotePayload) => {
    if (editingNote) return updateManualNote(editingNote.id, payload);
    return createManualNote(payload);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: notes.length },
    { key: 'manual', label: '📝 Học tập', count: manualNotes.length },
    { key: 'session', label: '🎤 Phỏng vấn', count: sessionNotes.length },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">📓 Ghi chú</h1>
          <p className="text-sm text-muted">
            Ghi chú học tập và ghi chú từ các phiên phỏng vấn
          </p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          + Ghi chú mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">
            {tab === 'session' ? '🎤' : '📭'}
          </p>
          <p className="text-foreground font-semibold mb-1">Chưa có ghi chú nào</p>
          <p className="text-sm text-muted">
            {tab === 'session'
              ? 'Bắt đầu phỏng vấn và ghi chú những gì bạn chưa biết nhé!'
              : 'Nhấn "+ Ghi chú mới" để tạo ghi chú học tập đầu tiên!'}
          </p>
        </div>
      )}

      {/* Notes list */}
      {!loading && displayed.length > 0 && (
        <div className="space-y-3">
          {displayed.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={note.source === 'manual' ? handleEdit : undefined}
              onDelete={async (id) => { await deleteNote(id); }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <NoteModal
        open={modalOpen}
        note={editingNote}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
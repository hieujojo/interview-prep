'use client';

import { useState } from 'react';
import { Note } from '@/types/note';

interface Props {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Xoá ghi chú này?')) return;
    setDeleting(true);
    await onDelete(note.id);
    setDeleting(false);
  };

  const formattedDate = note.updated_at
    ? new Date(note.updated_at).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  // --- Ghi chú phỏng vấn ---
  if (note.source === 'session') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
              🎤 Phỏng vấn
            </span>
            {note.title && (
              <span className="text-xs text-gray-500">{note.title}</span>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xoá"
          >
            🗑️
          </button>
        </div>

        {note.question_content && (
          <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">
            Q: {note.question_content}
          </p>
        )}

        {note.note_text && (
          <p className={`mt-2 text-sm text-gray-700 whitespace-pre-wrap ${!expanded ? 'line-clamp-3' : ''}`}>
            {note.note_text}
          </p>
        )}

        {note.note_text && note.note_text.length > 120 && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}

        <p className="mt-3 text-xs text-gray-400">{formattedDate}</p>
      </div>
    );
  }

  // --- Ghi chú học tập thủ công ---
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium shrink-0">
            📝 Học tập
          </span>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {note.title}
          </h3>
        </div>
        <div className="flex gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              ✏️
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xoá"
          >
            🗑️
          </button>
        </div>
      </div>

      {note.content && (
        <p className="mt-2 text-gray-600 text-xs line-clamp-3 whitespace-pre-wrap">
          {note.content}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">{formattedDate}</p>
    </div>
  );
}
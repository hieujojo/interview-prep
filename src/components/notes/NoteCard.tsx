'use client';

import { useState } from 'react';
import { LearningNote } from '@/types/note';

interface Props {
  note: LearningNote;
  onEdit: (note: LearningNote) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Xoá ghi chú này?')) return;
    setDeleting(true);
    await onDelete(note.id);
    setDeleting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {note.title}
        </h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            ✏️
          </button>
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

      <p className="mt-3 text-xs text-gray-400">
        {new Date(note.updated_at).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>
    </div>
  );
}
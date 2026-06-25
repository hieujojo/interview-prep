'use client';

import { useState } from 'react';
import { SessionNote } from '@/types/note';

interface Props {
  note: SessionNote;
  onDelete: (id: string) => void;
}

export function NoteSessionCard({ note, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const itemCount = note.items?.length ?? 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Xoá thẻ ghi chú này?')) return;
    setDeleting(true);
    await onDelete(note.id);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${expanded ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
        boxShadow: expanded ? '0 8px 30px rgba(139,92,246,0.1)' : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Card header — luôn hiển thị */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer group"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            📓
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{note.title}</p>
            <p className="text-xs text-muted mt-0.5">
              {itemCount} câu đã ghi chú •{' '}
              {new Date(note.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            🗑️
          </button>
          <span
            className="text-muted transition-transform duration-300 text-xs"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Expanded — danh sách note items */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2 animate-fadeIn">
          {(note.items ?? [])
            .sort((a, b) => a.question_index - b.question_index)
            .map((item, idx) => (
              <div
                key={item.id}
                className="flex gap-3 items-start p-3 rounded-xl"
                style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}
              >
                <span
                  className="shrink-0 w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {item.question_index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted line-clamp-1 mb-1">
                    {item.question_content}
                  </p>
                  <p className="text-sm text-foreground font-medium">{item.note_text}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
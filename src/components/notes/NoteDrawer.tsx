'use client';

import { useState, useEffect } from 'react';
import { InProgressNote } from '@/types/note';

interface Props {
  open: boolean;
  onClose: () => void;
  questions: { content: string; category: string }[];
  currentIndex: number;
  notes: InProgressNote[];
  onUpdateNote: (index: number, text: string) => void;
}

export function NoteDrawer({ open, onClose, questions, currentIndex, notes, onUpdateNote }: Props) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  useEffect(() => {
    if (!open || !activeQuestion) return;

    setIsLoadingSuggestions(true);
    setSuggestions([]);

    fetch('/api/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: activeQuestion.content }),
    })
      .then(r => r.json())
      .then(data => setSuggestions(data.keywords ?? []))
      .catch(() => setSuggestions([]))
      .finally(() => setIsLoadingSuggestions(false));
  }, [activeIndex, open]);
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  const activeNote = notes[activeIndex];
  const activeQuestion = questions[activeIndex];

  const handleAddSuggestion = (word: string) => {
    const current = activeNote?.noteText ?? '';
    const separator = current.trim() ? ', ' : '';
    onUpdateNote(activeIndex, current + separator + word);
  };

  const handleType = (text: string) => {
    onUpdateNote(activeIndex, text);
  };

  const hasNote = (idx: number) => !!notes[idx]?.noteText.trim();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: '380px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: open ? '-20px 0 60px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📓</span>
            <span className="font-bold text-foreground text-sm">Ghi chú phiên phỏng vấn</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Question tabs */}
        <div className="flex gap-1.5 px-4 py-3 border-b border-border overflow-x-auto shrink-0 scrollbar-hide">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all relative"
              style={{
                background: activeIndex === idx
                  ? 'var(--primary)'
                  : hasNote(idx)
                    ? 'rgba(139,92,246,0.15)'
                    : 'var(--surface-hover)',
                color: activeIndex === idx ? '#fff' : hasNote(idx) ? 'var(--primary)' : 'var(--muted)',
                border: activeIndex === idx ? 'none' : hasNote(idx) ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
              }}
            >
              {idx + 1}
              {hasNote(idx) && activeIndex !== idx && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Active question + note */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Question preview */}
          <div
            className="p-3 rounded-xl text-xs text-muted leading-relaxed"
            style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
              Câu {activeIndex + 1} • {activeQuestion?.category}
            </span>
            <p className="line-clamp-3">{activeQuestion?.content}</p>
          </div>

          {/* Note input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted block mb-2">
              Ghi chú nhanh
            </label>
            <input
              type="text"
              value={activeNote?.noteText ?? ''}
              onChange={e => handleType(e.target.value)}
              placeholder="Gõ hoặc chọn từ gợi ý bên dưới..."
              className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-bright)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            />
          </div>

          {/* AI suggestions */}
          {suggestions.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2">
                💡 Gợi ý từ khóa
              </p>
              {isLoadingSuggestions ? (
                <p className="text-xs text-muted animate-pulse">Đang phân tích câu hỏi...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => {
                    const used = (activeNote?.noteText ?? '').includes(s);
                    return (
                      <button
                      key={s}
                      onClick={() => !used && handleAddSuggestion(s)}
                      disabled={used}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: used ? 'rgba(139,92,246,0.2)' : 'var(--surface-hover)',
                        border: used ? '1px solid rgba(139,92,246,0.5)' : '1px solid var(--border)',
                        color: used ? 'var(--primary)' : 'var(--muted)',
                        cursor: used ? 'default' : 'pointer',
                        opacity: used ? 0.7 : 1,
                      }}
                    >
                      {used ? '✓ ' : '+ '}{s}
                    </button>
                  );
                })}
              </div>
              )}
            </div>
          )}

          {/* All notes summary */}
          {notes.some(n => n.noteText.trim()) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
                📋 Tổng hợp ghi chú
              </p>
              <div className="space-y-2">
                {notes.map((n, idx) =>
                  n.noteText.trim() ? (
                    <div
                      key={idx}
                      className="flex gap-2 items-start p-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center"
                        style={{ background: 'var(--primary)', color: '#fff' }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-xs text-foreground-2 leading-relaxed truncate">{n.noteText}</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <p className="text-[11px] text-muted text-center">
            {notes.filter(n => n.noteText.trim()).length}/{notes.length} câu đã ghi chú •
            Tự động lưu khi kết thúc phiên
          </p>
        </div>
      </div>
    </>
  );
}
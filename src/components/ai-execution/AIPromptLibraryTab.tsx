import React, { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { usePromptLibraryStore } from '../../store/promptLibraryStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

interface AIPromptLibraryTabProps {
  onUsePrompt: (prompt: string) => void;
}

export function AIPromptLibraryTab({ onUsePrompt }: AIPromptLibraryTabProps) {
  const prompts = usePromptLibraryStore((s) => s.prompts);
  const addPrompt = usePromptLibraryStore((s) => s.addPrompt);
  const deletePrompt = usePromptLibraryStore((s) => s.deletePrompt);
  const toggleFavorite = usePromptLibraryStore((s) => s.toggleFavorite);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  const handleCreate = () => {
    if (!title.trim() || !promptText.trim()) return;
    addPrompt({ title: title.trim(), prompt: promptText.trim(), favorite: false, isTemplate });
    setTitle('');
    setPromptText('');
    setIsTemplate(false);
    setCreating(false);
  };

  const sorted = [...prompts].sort(
    (a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setCreating((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors mb-4"
      >
        <Plus className="w-3.5 h-3.5" />
        New Prompt
      </button>

      {creating && (
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-4 mb-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prompt title" className={inputBase} />
          <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={3} placeholder="Prompt text…" className={`${inputBase} resize-none`} />
          <label className="flex items-center gap-1.5 text-[11px] text-white/50 cursor-pointer">
            <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} className="w-3.5 h-3.5 rounded accent-jade cursor-pointer" />
            Save as template
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || !promptText.trim()}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button type="button" onClick={() => setCreating(false)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-10">No saved prompts yet — save one to reuse it later or test it in the Playground.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((p) => (
            <div key={p.id} className="bg-noir-700 border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-white/85 truncate">{p.title}</p>
                <button type="button" onClick={() => toggleFavorite(p.id)} aria-label={`Toggle favorite for ${p.title}`} className="shrink-0">
                  <Star className={`w-3.5 h-3.5 transition-colors ${p.favorite ? 'fill-amber-400 text-amber-400' : 'text-white/25 hover:text-white/50'}`} />
                </button>
              </div>
              {p.isTemplate && (
                <span className="inline-block text-[9px] font-bold uppercase tracking-wide text-blue-400 border border-blue-400/25 rounded px-1.5 py-0.5 mb-2">
                  Template
                </span>
              )}
              <p className="text-xs text-white/50 mb-3">
                {p.prompt.length > 140 ? `${p.prompt.slice(0, 140)}…` : p.prompt}
              </p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => onUsePrompt(p.prompt)} className="text-[11px] font-semibold text-jade hover:text-jade-light transition-colors">
                  Use
                </button>
                <button type="button" onClick={() => deletePrompt(p.id)} className="text-[11px] font-semibold text-white/30 hover:text-red-400 transition-colors ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

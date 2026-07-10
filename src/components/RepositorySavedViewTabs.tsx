import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SavedView, useRepositoryViewStore } from '../store/repositoryViewStore';

interface RepositorySavedViewTabsProps {
  currentSnapshot: Omit<SavedView, 'id' | 'name' | 'createdAt'>;
  onApply: (view: SavedView) => void;
}

export function RepositorySavedViewTabs({ currentSnapshot, onApply }: RepositorySavedViewTabsProps) {
  const savedViews = useRepositoryViewStore((s) => s.savedViews);
  const saveView = useRepositoryViewStore((s) => s.saveView);
  const deleteView = useRepositoryViewStore((s) => s.deleteView);

  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    saveView({ ...currentSnapshot, name: name.trim() });
    setName('');
    setNaming(false);
  };

  const cancelNaming = () => {
    setNaming(false);
    setName('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {savedViews.map((v) => (
        <div
          key={v.id}
          className="group flex items-center gap-1 bg-noir-600 border border-white/[0.08] rounded-full pl-3 pr-1 py-1"
        >
          <button
            type="button"
            onClick={() => onApply(v)}
            className="text-[11px] font-semibold text-white/60 hover:text-jade transition-colors"
          >
            {v.name}
          </button>
          <button
            type="button"
            onClick={() => deleteView(v.id)}
            aria-label={`Delete view ${v.name}`}
            className="p-0.5 rounded-full text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {naming ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') cancelNaming();
            }}
            placeholder="View name"
            className="text-[11px] bg-noir-600 border border-white/[0.1] rounded-full px-3 py-1 text-white/80 focus:outline-none focus:border-jade transition-colors w-32"
          />
          <button type="button" onClick={handleSave} className="text-[11px] font-bold text-jade hover:text-jade-light transition-colors px-1">
            Save
          </button>
          <button type="button" onClick={cancelNaming} className="text-[11px] font-semibold text-white/35 hover:text-white transition-colors px-1">
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNaming(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-white/40 hover:text-jade transition-colors px-2 py-1"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          Save current view
        </button>
      )}
    </div>
  );
}

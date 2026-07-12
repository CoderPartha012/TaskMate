import React, { useEffect, useRef, useState } from 'react';
import { Columns, ChevronUp, ChevronDown } from 'lucide-react';
import { useRepositoryViewStore } from '../../store/repositoryViewStore';

export function RepositoryColumnsMenu() {
  const columns = useRepositoryViewStore((s) => s.columns);
  const toggleColumnVisibility = useRepositoryViewStore((s) => s.toggleColumnVisibility);
  const moveColumn = useRepositoryViewStore((s) => s.moveColumn);
  const resetColumns = useRepositoryViewStore((s) => s.resetColumns);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors shrink-0"
      >
        <Columns className="w-3.5 h-3.5" aria-hidden="true" />
        Columns
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-30 overflow-hidden">
          <div className="max-h-72 overflow-y-auto py-1">
            {columns.map((col, i) => (
              <div key={col.key} className="flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors">
                <label className="flex items-center gap-2 text-white/70 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumnVisibility(col.key)}
                    className="w-3.5 h-3.5 rounded accent-jade shrink-0"
                  />
                  <span className="truncate">{col.label}</span>
                </label>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveColumn(col.key, 'up')}
                    disabled={i === 0}
                    aria-label={`Move ${col.label} up`}
                    className="p-1 rounded text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveColumn(col.key, 'down')}
                    disabled={i === columns.length - 1}
                    aria-label={`Move ${col.label} down`}
                    className="p-1 rounded text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={resetColumns}
            className="w-full text-[11px] font-semibold text-white/40 hover:text-white border-t border-white/[0.07] px-3 py-2 transition-colors"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}

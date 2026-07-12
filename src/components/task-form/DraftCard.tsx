import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ListChecks, Workflow, KanbanSquare, Sparkles, FileSignature,
  MoreVertical, Trash2, RotateCcw, ArrowRightLeft,
} from 'lucide-react';
import { TaskType } from '../../types';
import { TaskDraft } from '../../types/draft.types';
import { TASK_TYPE_SHORT } from '../common/TaskTypeSelector';
import { DraftFormData, getPreviewChips } from '../../utils/draftFormData';
import { CATEGORY_COLORS } from '../../utils/categoryColors';

const CATEGORY_ICON: Record<TaskType, React.ReactNode> = {
  general: <ListChecks className="w-3 h-3" aria-hidden="true" />,
  workflow: <Workflow className="w-3 h-3" aria-hidden="true" />,
  project: <KanbanSquare className="w-3 h-3" aria-hidden="true" />,
  ai: <Sparkles className="w-3 h-3" aria-hidden="true" />,
  contract: <FileSignature className="w-3 h-3" aria-hidden="true" />,
};

const ALL_TYPES: TaskType[] = ['general', 'workflow', 'project', 'ai', 'contract'];

interface DraftCardProps {
  draft: TaskDraft;
  onResume: (draft: TaskDraft) => void;
  onDelete: (draft: TaskDraft) => void;
  onConvert: (draft: TaskDraft, newCategory: TaskType) => void;
}

export function DraftCard({ draft, onResume, onDelete, onConvert }: DraftCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConvertOptions, setShowConvertOptions] = useState(false);

  const color = CATEGORY_COLORS[draft.category];
  const data = draft.formData as DraftFormData;
  const title = (data.title || '').trim().slice(0, 50);
  const chips = getPreviewChips(draft.category, data);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowConvertOptions(false);
  };

  return (
    <div
      className="relative bg-[#1A1A2E] border border-white/[0.06] rounded-xl p-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
          style={{ backgroundColor: `${color}26`, color }}
        >
          {CATEGORY_ICON[draft.category]}
          {TASK_TYPE_SHORT[draft.category]}
        </span>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Draft options"
            aria-expanded={menuOpen}
            className="p-1 rounded-md text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 top-7 z-20 w-52 bg-noir-600 border border-white/[0.1] rounded-lg shadow-xl py-1">
                <button
                  type="button"
                  onClick={() => { onResume(draft); closeMenu(); }}
                  className="w-full flex items-center gap-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 px-3 py-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Resume editing
                </button>
                <button
                  type="button"
                  onClick={() => { onDelete(draft); closeMenu(); }}
                  className="w-full flex items-center gap-2 text-left text-xs text-red-400 hover:bg-red-500/10 px-3 py-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Delete draft
                </button>
                <button
                  type="button"
                  onClick={() => setShowConvertOptions((v) => !v)}
                  className="w-full flex items-center gap-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 px-3 py-2 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  Convert to different category
                </button>
                {showConvertOptions && (
                  <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-white/[0.06]">
                    {ALL_TYPES.filter((t) => t !== draft.category).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { onConvert(draft, t); closeMenu(); }}
                        className="text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                        style={{ backgroundColor: `${CATEGORY_COLORS[t]}26`, color: CATEGORY_COLORS[t] }}
                      >
                        {TASK_TYPE_SHORT[t]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className={`text-sm font-semibold mb-2 ${title ? 'text-white/85' : 'text-white/30 italic'}`}>
        {title || 'Untitled Draft'}
      </p>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {chips.map((chip) => (
            <span key={chip} className="text-[10px] font-medium text-white/50 bg-white/[0.05] rounded px-1.5 py-0.5">
              {chip}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${draft.completionPercent}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] font-semibold text-white/40 shrink-0">{draft.completionPercent}% complete</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-white/30">
          {formatDistanceToNow(new Date(draft.lastModified), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(draft)}
            className="text-[11px] font-semibold text-white/30 hover:text-red-400 transition-colors px-2 py-1"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => onResume(draft)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: color, color: '#0B0B12' }}
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}

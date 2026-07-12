import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { TaskType } from '../../types';
import { TaskDraft } from '../../types/draft.types';
import { useDraftStore, sortDraftsByRecency } from '../../store/draftStore';
import { DraftCard } from './DraftCard';

const COLLAPSED_LIMIT = 3;

interface DraftsSectionProps {
  onResume: (draft: TaskDraft) => void;
  onDelete: (draft: TaskDraft) => void;
  onConvert: (draft: TaskDraft, newCategory: TaskType) => void;
}

export function DraftsSection({ onResume, onDelete, onConvert }: DraftsSectionProps) {
  const drafts = useDraftStore((s) => s.drafts);
  const [expanded, setExpanded] = useState(false);

  if (drafts.length === 0) return null;

  const sorted = sortDraftsByRecency(drafts);
  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        Drafts ({drafts.length})
      </p>

      <div className="space-y-3">
        {visible.map((draft) => (
          <DraftCard key={draft.id} draft={draft} onResume={onResume} onDelete={onDelete} onConvert={onConvert} />
        ))}
      </div>

      {sorted.length > COLLAPSED_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[11px] font-semibold text-jade hover:text-jade-light transition-colors"
        >
          {expanded ? 'Show less' : `Show all ${sorted.length} drafts`}
        </button>
      )}
    </div>
  );
}

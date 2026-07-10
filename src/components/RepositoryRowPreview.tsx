import React from 'react';
import { Task } from '../types';
import { getTaskProgress } from '../utils/taskProgress';

interface RepositoryRowPreviewProps {
  task: Task;
  top: number;
  left: number;
}

export function RepositoryRowPreview({ task, top, left }: RepositoryRowPreviewProps) {
  const progress = getTaskProgress(task);
  const description = task.description.slice(0, 150);
  const tags = task.generalMeta?.tags ?? [];

  return (
    <div
      className="fixed z-40 w-72 bg-noir-700 border border-white/[0.1] rounded-xl shadow-2xl p-4 pointer-events-none"
      style={{ top, left }}
    >
      <p className="text-xs font-bold text-white/85 mb-1.5 truncate">{task.title}</p>
      {description && (
        <p className="text-[11px] text-white/50 leading-relaxed mb-2">
          {description}{task.description.length > 150 ? '…' : ''}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="text-[9px] font-semibold text-white/50 bg-white/[0.06] rounded px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-jade rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-white/40 shrink-0">{progress}%</span>
      </div>
    </div>
  );
}

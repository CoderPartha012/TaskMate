import React from 'react';
import { Task } from '../../types';

const inputBase =
  'block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors resize-none';

interface TaskDescriptionSectionProps {
  task: Task;
  editing: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function TaskDescriptionSection({ task, editing, value, onChange }: TaskDescriptionSectionProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4">Description</h3>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Add a description for this task…"
          aria-label="Task description"
          className={inputBase}
        />
      ) : task.description ? (
        <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{task.description}</p>
      ) : (
        <p className="text-xs text-white/30">No description yet.</p>
      )}
    </div>
  );
}

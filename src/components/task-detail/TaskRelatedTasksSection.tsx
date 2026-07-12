import React, { useEffect, useRef, useState } from 'react';
import { Link2, X, Eye, Plus } from 'lucide-react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';

const statusDot: Record<string, string> = {
  completed: 'bg-jade',
  'in-progress': 'bg-blue-400',
  pending: 'bg-white/30',
};

interface TaskRelatedTasksSectionProps {
  task: Task;
}

export function TaskRelatedTasksSection({ task }: TaskRelatedTasksSectionProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const setActiveSection = useTaskStore((s) => s.setActiveSection);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const dependencies = task.dependencies ?? [];
  const related = dependencies.map((id) => tasks.find((t) => t.id === id)).filter((t): t is Task => !!t);

  const candidates = tasks
    .filter((t) => t.id !== task.id && !dependencies.includes(t.id))
    .filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8);

  const addDependency = (id: string) => {
    updateTask(task.id, { dependencies: [...dependencies, id] });
    setQuery('');
    setOpen(false);
  };

  const removeDependency = (id: string) => {
    updateTask(task.id, { dependencies: dependencies.filter((d) => d !== id) });
  };

  const viewTask = (id: string) => {
    setViewingTaskId(id);
    setActiveSection('task-detail');
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-jade" aria-hidden="true" />
        Related Tasks
      </h3>

      {related.length > 0 ? (
        <ul className="space-y-1.5 mb-3">
          {related.map((t) => (
            <li key={t.id} className="flex items-center gap-2.5 group bg-noir-600 border border-white/[0.06] rounded-lg px-3 py-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[t.status]}`} aria-hidden="true" />
              <span className="flex-1 min-w-0 text-xs text-white/75 truncate">{t.title}</span>
              <button
                type="button"
                onClick={() => viewTask(t.id)}
                title="View task"
                aria-label={`View ${t.title}`}
                className="p-1 rounded text-white/35 hover:text-jade transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeDependency(t.id)}
                title="Remove relation"
                aria-label={`Remove relation to ${t.title}`}
                className="p-1 rounded text-white/25 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30 mb-3">No related tasks linked yet.</p>
      )}

      <div ref={ref} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Link a related task…"
          aria-label="Search tasks to link"
          className="w-full rounded-lg bg-noir-600 text-white/80 text-xs px-3 py-2 border border-white/[0.08] focus:border-jade focus:outline-none transition-colors placeholder:text-white/25"
        />
        {open && query.trim() && candidates.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-noir-600 border border-white/[0.08] rounded-lg shadow-2xl z-20 max-h-52 overflow-y-auto">
            {candidates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addDependency(t.id)}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3 text-jade shrink-0" />
                <span className="truncate">{t.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Trash2, ListTodo } from 'lucide-react';
import { Task, Subtask } from '../../types';
import { useTaskStore } from '../../store/taskStore';

interface TaskSubtasksSectionProps {
  task: Task;
}

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [newTitle, setNewTitle] = useState('');

  const completedCount = task.subtasks.filter((s) => s.completed).length;

  const addSubtask = () => {
    const title = newTitle.trim();
    if (!title) return;
    const subtask: Subtask = { id: crypto.randomUUID(), title, completed: false };
    updateTask(
      task.id,
      { subtasks: [...task.subtasks, subtask] },
      [{ type: 'metadata_updated', message: `Added subtask "${title}"`, user: 'You' }]
    );
    setNewTitle('');
  };

  const toggleSubtask = (id: string) => {
    const target = task.subtasks.find((s) => s.id === id);
    if (!target) return;
    const updated = task.subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    updateTask(
      task.id,
      { subtasks: updated },
      [{ type: 'metadata_updated', message: `${target.completed ? 'Reopened' : 'Completed'} subtask "${target.title}"`, user: 'You' }]
    );
  };

  const deleteSubtask = (id: string) => {
    const target = task.subtasks.find((s) => s.id === id);
    if (!target) return;
    updateTask(
      task.id,
      { subtasks: task.subtasks.filter((s) => s.id !== id) },
      [{ type: 'metadata_updated', message: `Removed subtask "${target.title}"`, user: 'You' }]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-jade" aria-hidden="true" />
          Subtasks
        </h3>
        {task.subtasks.length > 0 && (
          <span className="text-[11px] font-semibold text-white/40">{completedCount}/{task.subtasks.length} done</span>
        )}
      </div>

      {task.subtasks.length > 0 ? (
        <ul className="space-y-1.5 mb-3">
          {task.subtasks.map((s) => (
            <li key={s.id} className="flex items-center gap-2.5 group">
              <input
                type="checkbox"
                checked={s.completed}
                onChange={() => toggleSubtask(s.id)}
                aria-label={`Mark "${s.title}" ${s.completed ? 'incomplete' : 'complete'}`}
                className="w-4 h-4 rounded accent-jade shrink-0 cursor-pointer"
              />
              <span className={`flex-1 text-xs ${s.completed ? 'text-white/30 line-through' : 'text-white/75'}`}>
                {s.title}
              </span>
              <button
                type="button"
                onClick={() => deleteSubtask(s.id)}
                aria-label={`Delete subtask "${s.title}"`}
                className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30 mb-3">No subtasks yet — break this task down into smaller steps.</p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask…"
          aria-label="New subtask title"
          className="flex-1 rounded-lg bg-noir-600 text-white/80 text-xs px-3 py-2 border border-white/[0.08] focus:border-jade focus:outline-none transition-colors placeholder:text-white/25"
        />
        <button
          type="button"
          onClick={addSubtask}
          disabled={!newTitle.trim()}
          className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

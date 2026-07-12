import React, { useEffect, useRef, useState } from 'react';
import { X, UserCog, Trash2 } from 'lucide-react';
import { Priority, Status, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useToastStore } from '../../store/toastStore';
import { RepositoryExportMenu } from './RepositoryExportMenu';

const selectClass =
  'text-xs font-semibold bg-noir-700 border border-white/[0.06] rounded-lg px-2.5 py-2 text-white/70 hover:text-white hover:border-white/[0.15] focus:outline-none focus:border-jade transition-colors cursor-pointer';

interface RepositoryBulkActionBarProps {
  selectedIds: string[];
  tasks: Task[];
  onClearSelection: () => void;
}

export function RepositoryBulkActionBar({ selectedIds, tasks, onClearSelection }: RepositoryBulkActionBarProps) {
  const bulkUpdateTasks = useTaskStore((s) => s.bulkUpdateTasks);
  const bulkDeleteTasks = useTaskStore((s) => s.bulkDeleteTasks);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState('');
  const assigneeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) setAssigneeOpen(false);
    }
    if (assigneeOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [assigneeOpen]);

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;
  const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id));
  const notify = (message: string) => useToastStore.getState().showToast({ message });

  const handleStatusChange = (status: Status) => {
    bulkUpdateTasks(selectedIds, { status });
    notify(`Updated status for ${count} task${count > 1 ? 's' : ''}`);
    onClearSelection();
  };

  const handlePriorityChange = (priority: Priority) => {
    bulkUpdateTasks(selectedIds, { priority });
    notify(`Updated priority for ${count} task${count > 1 ? 's' : ''}`);
    onClearSelection();
  };

  const handleAssigneeApply = () => {
    const assignees = assigneeInput.split(',').map((s) => s.trim()).filter(Boolean);
    bulkUpdateTasks(selectedIds, { assignees });
    notify(`Updated assignee for ${count} task${count > 1 ? 's' : ''}`);
    setAssigneeOpen(false);
    setAssigneeInput('');
    onClearSelection();
  };

  const handleDelete = () => {
    bulkDeleteTasks(selectedIds);
    notify(`Deleted ${count} task${count > 1 ? 's' : ''}`);
    setConfirmDelete(false);
    onClearSelection();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-noir-700 border border-white/[0.06] rounded-xl px-4 py-3">
      <span className="text-xs font-bold text-white/85 pr-3 border-r border-white/[0.08] whitespace-nowrap">
        {count} selected
      </span>

      <select
        value=""
        onChange={(e) => e.target.value && handleStatusChange(e.target.value as Status)}
        className={selectClass}
      >
        <option value="" disabled>Change Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <div ref={assigneeRef} className="relative">
        <button
          type="button"
          onClick={() => setAssigneeOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors"
        >
          <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
          Change Assignee
        </button>
        {assigneeOpen && (
          <div className="absolute top-full mt-2 left-0 w-56 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl p-2.5 z-30">
            <input
              type="text"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              placeholder="Name or email, comma-separated"
              autoFocus
              className="w-full rounded-lg bg-noir-600 text-white/80 text-xs px-2.5 py-1.5 border border-white/[0.08] focus:outline-none focus:border-jade transition-colors placeholder:text-white/25 mb-2"
            />
            <button
              type="button"
              onClick={handleAssigneeApply}
              className="w-full text-[11px] font-bold px-2 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <select
        value=""
        onChange={(e) => e.target.value && handlePriorityChange(e.target.value as Priority)}
        className={selectClass}
      >
        <option value="" disabled>Change Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <RepositoryExportMenu tasks={selectedTasks} label="Export Selected" />

      <div className="ml-auto flex items-center gap-2">
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-red-300 whitespace-nowrap">Delete {count}?</span>
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] font-semibold px-2 py-1.5 rounded-lg text-white/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
        )}

        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
          className="p-1.5 rounded-lg text-white/35 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

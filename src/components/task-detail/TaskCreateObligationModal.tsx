import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, X } from 'lucide-react';
import { Obligation, Priority, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30 block mb-1';

function defaultDueDate(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface TaskCreateObligationModalProps {
  task: Task;
  onClose: () => void;
  onCreated: (obligationId: string) => void;
}

export function TaskCreateObligationModal({ task, onClose, onCreated }: TaskCreateObligationModalProps) {
  const updateTask = useTaskStore((s) => s.updateTask);

  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('You');
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [reminderDate, setReminderDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    const now = new Date().toISOString();
    const obligation: Obligation = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: description.trim(),
      notes: '',
      owner: owner.trim() || 'You',
      dueDate,
      reminderDate: reminderDate || undefined,
      status: 'upcoming',
      priority,
      progress: 0,
      comments: [],
      history: [{ id: crypto.randomUUID(), message: 'Obligation created', user: 'You', timestamp: now }],
      createdAt: now,
      createdBy: 'You',
    };

    updateTask(
      task.id,
      { obligations: [...(task.obligations ?? []), obligation] },
      [{ type: 'metadata_updated', message: `Created obligation "${trimmedTitle}"`, user: 'You' }]
    );
    onCreated(obligation.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="bg-noir-800 border border-white/[0.08] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-jade" aria-hidden="true" />
                Create Obligation
              </h3>
              <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className={labelClass} htmlFor="obligation-title">Title</label>
                <input
                  id="obligation-title"
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(''); }}
                  placeholder="e.g. Renew software license"
                  className={inputBase}
                />
                {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="obligation-owner">Owner</label>
                  <input
                    id="obligation-owner"
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Name or email"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="obligation-priority">Priority</label>
                  <select
                    id="obligation-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={inputBase}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="obligation-due">Due Date</label>
                  <input
                    id="obligation-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="obligation-reminder">Reminder</label>
                  <input
                    id="obligation-reminder"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="obligation-description">Description</label>
                <textarea
                  id="obligation-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What does this obligation require? (optional)"
                  className={`${inputBase} resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
              >
                Create Obligation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

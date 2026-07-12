import React, { useEffect, useState } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { Plus, Bell, Eye, Trash2, ClipboardList, X } from 'lucide-react';
import { Obligation, ObligationStatus, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { TaskObligationDrawer } from './TaskObligationDrawer';
import { TaskCreateObligationModal } from './TaskCreateObligationModal';
import { RepositoryPagination } from '../common/RepositoryPagination';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

type ConfirmTarget = { type: 'single'; obligation: Obligation } | { type: 'bulk' } | null;

const statusStyles: Record<ObligationStatus, string> = {
  upcoming: 'bg-blue-500/15 text-blue-500',
  'due-soon': 'bg-amber-500/15 text-amber-500',
  overdue: 'bg-red-500/15 text-red-500',
  completed: 'bg-jade/15 text-jade',
};

const statusLabel: Record<ObligationStatus, string> = {
  upcoming: 'Upcoming',
  'due-soon': 'Due Soon',
  overdue: 'Overdue',
  completed: 'Completed',
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/15 text-red-500 border border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  low: 'bg-jade/15 text-jade border border-jade/20',
};

export function computeObligationStatus(o: Obligation): ObligationStatus {
  if (o.status === 'completed') return 'completed';
  const daysLeft = differenceInCalendarDays(new Date(o.dueDate), new Date());
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 7) return 'due-soon';
  return 'upcoming';
}

function safeDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
}

interface TaskObligationsTabProps {
  task: Task;
}

export function TaskObligationsTab({ task }: TaskObligationsTabProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [activeObligationId, setActiveObligationId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const obligations = task.obligations ?? [];

  useEffect(() => {
    setPage(1);
  }, [pageSize, obligations.length]);

  const handleDelete = (obligation: Obligation) => {
    updateTask(
      task.id,
      { obligations: obligations.filter((o) => o.id !== obligation.id) },
      [{ type: 'metadata_updated', message: `Deleted obligation "${obligation.title}"`, user: 'You' }]
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(obligation.id);
      return next;
    });
    setConfirmTarget(null);
    if (activeObligationId === obligation.id) setActiveObligationId(null);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    updateTask(
      task.id,
      { obligations: obligations.filter((o) => !selectedIds.has(o.id)) },
      [{ type: 'metadata_updated', message: `Deleted ${count} obligation${count > 1 ? 's' : ''}`, user: 'You' }]
    );
    if (activeObligationId && selectedIds.has(activeObligationId)) setActiveObligationId(null);
    setSelectedIds(new Set());
    setConfirmTarget(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const total = obligations.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = obligations.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  const allOnPageSelected = paginated.length > 0 && paginated.every((o) => selectedIds.has(o.id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paginated.forEach((o) => next.delete(o.id));
      else paginated.forEach((o) => next.add(o.id));
      return next;
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors mb-4"
      >
        <Plus className="w-4 h-4" />
        Create Obligation
      </button>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-noir-700 border border-white/[0.06] rounded-lg px-4 py-2.5 mb-3">
          <span className="text-xs font-bold text-white/85">{selectedIds.size} selected</span>
          <button
            type="button"
            onClick={() => setConfirmTarget({ type: 'bulk' })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
            className="ml-auto p-1.5 rounded-lg text-white/35 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {obligations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
            <ClipboardList className="w-5 h-5 text-white/25" aria-hidden="true" />
          </span>
          <p className="text-xs text-white/40">No obligations yet — create one to start tracking contractual commitments.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all obligations on this page"
                      className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Obligation</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Owner</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Due Date</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Reminder</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Priority</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Progress</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o) => {
                  const status = computeObligationStatus(o);
                  const isSelected = selectedIds.has(o.id);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setActiveObligationId(o.id)}
                      className={`hover:bg-white/[0.03] transition-colors text-xs cursor-pointer ${isSelected ? 'bg-jade/[0.05]' : ''}`}
                    >
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(o.id)}
                          aria-label={`Select ${o.title}`}
                          className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-white/80 max-w-[220px] truncate" title={o.title}>{o.title}</td>
                      <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">{o.owner}</td>
                      <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{safeDate(o.dueDate)}</td>
                      <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">
                        {o.reminderDate ? (
                          <span className="flex items-center gap-1"><Bell className="w-3 h-3 text-white/25" />{safeDate(o.reminderDate)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap ${statusStyles[status]}`}>
                          {statusLabel[status]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap ${priorityStyles[o.priority]}`}>
                          {o.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 w-24">
                          <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-jade rounded-full transition-all duration-500" style={{ width: `${o.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-white/40 w-7 shrink-0">{o.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setActiveObligationId(o.id)} title="Open" aria-label={`Open ${o.title}`} className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setConfirmTarget({ type: 'single', obligation: o })} title="Delete" aria-label={`Delete ${o.title}`} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <RepositoryPagination
              page={clampedPage}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      <AnimatePresence>
        {activeObligationId && (
          <TaskObligationDrawer task={task} obligationId={activeObligationId} onClose={() => setActiveObligationId(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createOpen && (
          <TaskCreateObligationModal
            task={task}
            onClose={() => setCreateOpen(false)}
            onCreated={(id) => { setCreateOpen(false); setActiveObligationId(id); }}
          />
        )}
      </AnimatePresence>

      {confirmTarget?.type === 'single' && (
        <ConfirmDeleteModal
          title="Delete Obligation"
          message={`Delete "${confirmTarget.obligation.title}" permanently? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmTarget.obligation)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
      {confirmTarget?.type === 'bulk' && (
        <ConfirmDeleteModal
          title="Delete Obligations"
          message={`Delete ${selectedIds.size} selected obligation${selectedIds.size > 1 ? 's' : ''} permanently? This cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

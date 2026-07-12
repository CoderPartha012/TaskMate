import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Eye, Search, Inbox } from 'lucide-react';
import { AIExecutionStatus, Task } from '../../types';
import { FlatRun, flattenExecutionRuns, formatDuration } from '../../utils/aiExecutionRuns';
import { RepositoryPagination } from '../common/RepositoryPagination';
import { AIExecutionRunDetailModal } from './AIExecutionRunDetailModal';
import { AIExecutionCompareModal } from './AIExecutionCompareModal';

const STATUS_STYLES: Record<AIExecutionStatus, string> = {
  idle: 'bg-white/[0.06] text-white/40',
  running: 'bg-blue-500/15 text-blue-500',
  success: 'bg-jade/15 text-jade',
  failed: 'bg-red-500/15 text-red-500',
};

interface AIExecutionHistoryTabProps {
  tasks: Task[];
  onOpenTask: (taskId: string) => void;
}

export function AIExecutionHistoryTab({ tasks, onOpenTask }: AIExecutionHistoryTabProps) {
  const runs = useMemo(() => flattenExecutionRuns(tasks), [tasks]);

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRun, setDetailRun] = useState<FlatRun | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  const filtered = runs.filter((run) => !search.trim() || run.taskTitle.toLowerCase().includes(search.trim().toLowerCase()));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedRuns = selectedIds.map((id) => runs.find((r) => r.id === id)).filter((r): r is FlatRun => !!r);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by task…"
            aria-label="Search execution history"
            className="w-full bg-noir-700 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
          />
        </div>
        {selectedIds.length > 0 && (
          <span className="text-[11px] text-white/40 ml-auto">
            {selectedIds.length === 2 ? 'Comparing 2 runs…' : 'Select one more run to compare'}
          </span>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-white/25" aria-hidden="true" />
          </span>
          <p className="text-xs text-white/40">No executions yet — run an AI task to see its history here.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2.5 w-8" />
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Run ID</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Task</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Started</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Ended</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Duration</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((run) => (
                  <tr key={run.id} className="hover:bg-white/[0.03] transition-colors text-xs">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(run.id)}
                        onChange={() => toggleSelect(run.id)}
                        aria-label={`Select run ${run.id.slice(0, 8)}`}
                        className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-white/45">{run.id.slice(0, 8)}</td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <button type="button" onClick={() => onOpenTask(run.taskId)} className="text-white/75 hover:text-jade transition-colors truncate block w-full text-left">
                        {run.taskTitle}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{format(new Date(run.startedAt), 'MMM d, h:mm a')}</td>
                    <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{run.completedAt ? format(new Date(run.completedAt), 'MMM d, h:mm a') : '—'}</td>
                    <td className="px-3 py-2.5 text-white/45 whitespace-nowrap">{formatDuration(run.durationMs)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap ${STATUS_STYLES[run.status]}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" onClick={() => setDetailRun(run)} title="View Details" aria-label="View run details" className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <RepositoryPagination page={clampedPage} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </div>
        </>
      )}

      {detailRun && (
        <AIExecutionRunDetailModal run={detailRun} onClose={() => setDetailRun(null)} onOpenTask={onOpenTask} />
      )}
      {selectedRuns.length === 2 && (
        <AIExecutionCompareModal runA={selectedRuns[0]} runB={selectedRuns[1]} onClose={() => setSelectedIds([])} />
      )}
    </div>
  );
}

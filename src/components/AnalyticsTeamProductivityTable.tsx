import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Task } from '../types';
import { getTeamProductivity, TeamProductivityRow } from '../utils/analyticsData';
import { EmptyState } from './analyticsShared';

type SortKey = keyof TeamProductivityRow;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'assignee', label: 'Assignee' },
  { key: 'assigned', label: 'Assigned Tasks' },
  { key: 'completed', label: 'Completed Tasks' },
  { key: 'pending', label: 'Pending Tasks' },
  { key: 'completionPct', label: 'Completion %' },
  { key: 'avgCompletionHours', label: 'Avg. Completion Time' },
];

function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 48) return `${hours}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function AnalyticsTeamProductivityTable({ tasks }: { tasks: Task[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('assigned');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = getTeamProductivity(tasks);

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    let cmp = 0;
    if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
    else cmp = (av as number ?? -1) - (bv as number ?? -1);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <p className="font-display font-bold text-sm text-white/80">Team Productivity</p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-4">Per-assignee workload and completion performance</p>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-white/[0.12]">
                {COLUMNS.map(({ key, label }) => (
                  <th key={key} className="p-0">
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className="w-full flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 px-3 py-2.5 transition-colors whitespace-nowrap"
                    >
                      {label}
                      {sortKey === key ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.assignee} className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-3 py-2.5 text-sm font-semibold text-white/85 whitespace-nowrap">{row.assignee}</td>
                  <td className="px-3 py-2.5 text-xs text-white/60">{row.assigned}</td>
                  <td className="px-3 py-2.5 text-xs text-jade font-semibold">{row.completed}</td>
                  <td className="px-3 py-2.5 text-xs text-white/60">{row.pending}</td>
                  <td className="px-3 py-2.5 text-xs text-white/60">{row.completionPct}%</td>
                  <td className="px-3 py-2.5 text-xs text-white/60">{formatHours(row.avgCompletionHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

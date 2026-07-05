import React, { useMemo, useState } from 'react';
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ReportGroup } from '../utils/reportBuilder';
import { GroupByKey, ReportColumnKey } from '../types/report.types';
import { RepositoryPagination } from './RepositoryPagination';

interface ReportPreviewTableProps {
  groups: ReportGroup[];
  columns: { key: ReportColumnKey; label: string }[];
  groupBy: GroupByKey;
}

export function ReportPreviewTable({ groups, columns, groupBy }: ReportPreviewTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const flat = useMemo(() => {
    const items: { groupLabel: string; row: Record<string, string> }[] = [];
    groups.forEach((g) => g.rows.forEach((row) => items.push({ groupLabel: g.label, row })));
    return items;
  }, [groups]);

  const searched = useMemo(() => {
    if (!search.trim()) return flat;
    const term = search.trim().toLowerCase();
    return flat.filter((item) => Object.values(item.row).some((v) => v.toLowerCase().includes(term)));
  }, [flat, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return searched;
    const copy = [...searched];
    copy.sort((a, b) => {
      const cmp = (a.row[sortKey] ?? '').localeCompare(b.row[sortKey] ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [searched, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  let lastGroupLabel: string | null = null;

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display font-bold text-sm text-white/80">Report Preview</p>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search preview…"
            className="w-full bg-noir-600 border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-jade transition-colors"
          />
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No rows match the current report configuration.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-white/[0.12]">
                  {groupBy && <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Group</th>}
                  {columns.map((c) => (
                    <th key={c.key} className="p-0">
                      <button
                        type="button"
                        onClick={() => handleSort(c.key)}
                        className="w-full flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 px-3 py-2.5 transition-colors whitespace-nowrap"
                      >
                        {c.label}
                        {sortKey === c.key ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, i) => {
                  const showGroupHeader = groupBy && item.groupLabel !== lastGroupLabel;
                  lastGroupLabel = item.groupLabel;
                  return (
                    <React.Fragment key={i}>
                      {showGroupHeader && (
                        <tr>
                          <td colSpan={columns.length + 1} className="px-3 pt-4 pb-1.5 text-[11px] font-bold text-jade uppercase tracking-wide">
                            {item.groupLabel} <span className="text-white/30 normal-case font-normal">({groups.find((g) => g.label === item.groupLabel)?.rows.length ?? 0})</span>
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                        {groupBy && <td className="px-3 py-2 text-xs text-white/40">{item.groupLabel}</td>}
                        {columns.map((c) => (
                          <td key={c.key} className="px-3 py-2 text-xs text-white/65 whitespace-nowrap">{item.row[c.key]}</td>
                        ))}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <RepositoryPagination page={clampedPage} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  );
}

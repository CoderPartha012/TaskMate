import React, { useEffect, useState } from 'react';
import { Filter, AlertTriangle, Sparkles } from 'lucide-react';
import { Task, Status, Priority, TaskType } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useRepositoryViewStore, SavedView } from '../store/repositoryViewStore';
import { RepositoryTable } from './RepositoryTable';
import { RepositoryFilterDrawer } from './RepositoryFilterDrawer';
import { RepositoryPagination } from './RepositoryPagination';
import { RepositoryQuickFilters } from './RepositoryQuickFilters';
import { RepositoryActiveFilterPills } from './RepositoryActiveFilterPills';
import { RepositorySummaryBar } from './RepositorySummaryBar';
import { RepositoryColumnsMenu } from './RepositoryColumnsMenu';
import { RepositoryExportMenu } from './RepositoryExportMenu';
import { RepositoryBulkActionBar } from './RepositoryBulkActionBar';
import { RepositorySavedViewTabs } from './RepositorySavedViewTabs';
import { RepoSortKey, GroupByKey, DateDisplayMode } from './repositoryColumnTypes';
import {
  RepositoryFilters, EMPTY_REPOSITORY_FILTERS, QuickFilterKey,
  applyRepositoryFilters, applyQuickFilter, activeFilterCount,
} from './repositoryFilterTypes';

const priorityWeight = { low: 0, medium: 1, high: 2 };

interface RepositoryTableViewProps {
  tasks: Task[];
  searchTerm: string;
}

export function RepositoryTableView({ tasks, searchTerm }: RepositoryTableViewProps) {
  const setActiveSection = useTaskStore((s) => s.setActiveSection);
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const setEditOnOpen = useTaskStore((s) => s.setEditOnOpen);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const loadSampleData = useTaskStore((s) => s.loadSampleData);

  const columns = useRepositoryViewStore((s) => s.columns);
  const setColumnWidth = useRepositoryViewStore((s) => s.setColumnWidth);
  const density = useRepositoryViewStore((s) => s.density);
  const setDensity = useRepositoryViewStore((s) => s.setDensity);
  const pushRecentFilter = useRepositoryViewStore((s) => s.pushRecentFilter);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<RepositoryFilters>(EMPTY_REPOSITORY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RepositoryFilters>(EMPTY_REPOSITORY_FILTERS);
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey>('all');
  const [sortKey, setSortKey] = useState<RepoSortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [groupByKey, setGroupByKey] = useState<GroupByKey | null>(null);
  const [dateDisplayMode, setDateDisplayMode] = useState<DateDisplayMode>('relative');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
  }, [searchTerm, appliedFilters, quickFilter, pageSize]);

  const searched = tasks.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.title.toLowerCase().includes(term) ||
      t.assignees.some((a) => a.toLowerCase().includes(term))
    );
  });

  const quickFiltered = applyQuickFilter(searched, quickFilter);
  const filtered = applyRepositoryFilters(quickFiltered, appliedFilters);

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'id': cmp = a.id.localeCompare(b.id); break;
      case 'title': cmp = a.title.localeCompare(b.title); break;
      case 'taskType': cmp = a.taskType.localeCompare(b.taskType); break;
      case 'status': cmp = a.status.localeCompare(b.status); break;
      case 'priority': cmp = priorityWeight[a.priority] - priorityWeight[b.priority]; break;
      case 'assignee': cmp = a.assignees.join(',').localeCompare(b.assignees.join(',')); break;
      case 'createdBy': cmp = a.createdBy.localeCompare(b.createdBy); break;
      case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      case 'dueDate': cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break;
      case 'lastModified': cmp = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime(); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginated = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  const tableRows = groupByKey ? sorted : paginated;

  const counts = { category: {} as Partial<Record<TaskType, number>>, status: {} as Partial<Record<Status, number>>, priority: {} as Partial<Record<Priority, number>> };
  quickFiltered.forEach((t) => {
    counts.category[t.taskType] = (counts.category[t.taskType] ?? 0) + 1;
    counts.status[t.status] = (counts.status[t.status] ?? 0) + 1;
    counts.priority[t.priority] = (counts.priority[t.priority] ?? 0) + 1;
  });

  const handleSort = (key: RepoSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleView = (id: string) => {
    setViewingTaskId(id);
    setActiveSection('task-detail');
  };

  const handleEdit = (id: string) => {
    setViewingTaskId(id);
    setEditOnOpen(true);
    setActiveSection('task-detail');
  };

  const handleApply = () => {
    setAppliedFilters(filterDraft);
    pushRecentFilter(filterDraft);
    setFilterOpen(false);
  };

  const handleReset = () => {
    setFilterDraft(EMPTY_REPOSITORY_FILTERS);
    setAppliedFilters(EMPTY_REPOSITORY_FILTERS);
  };

  const handleClearAll = () => {
    setFilterDraft(EMPTY_REPOSITORY_FILTERS);
    setAppliedFilters(EMPTY_REPOSITORY_FILTERS);
    setFilterOpen(false);
  };

  const handleRemoveFilterField = (patch: Partial<RepositoryFilters>) => {
    const next = { ...appliedFilters, ...patch };
    setFilterDraft(next);
    setAppliedFilters(next);
  };

  const handleSelectStatus = (status: Status) => {
    const next = { ...EMPTY_REPOSITORY_FILTERS, status: [status] };
    setFilterDraft(next);
    setAppliedFilters(next);
    setQuickFilter('all');
  };

  const handleSelectTotal = () => {
    setFilterDraft(EMPTY_REPOSITORY_FILTERS);
    setAppliedFilters(EMPTY_REPOSITORY_FILTERS);
    setQuickFilter('all');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = tableRows.length > 0 && tableRows.every((t) => next.has(t.id));
      tableRows.forEach((t) => { if (allSelected) next.delete(t.id); else next.add(t.id); });
      return next;
    });
  };

  const selectAllAcrossPages = () => setSelectedIds(new Set(sorted.map((t) => t.id)));

  const handleApplySavedView = (view: SavedView) => {
    setFilterDraft(view.filters);
    setAppliedFilters(view.filters);
    setQuickFilter(view.quickFilter);
    setSortKey(view.sortKey);
    setSortDir(view.sortDir);
    setGroupByKey(view.groupByKey);
  };

  const filterCount = activeFilterCount(appliedFilters);
  const taskToDelete = confirmDeleteId ? tasks.find((t) => t.id === confirmDeleteId) : null;
  const showSelectAcrossPages = !groupByKey && selectedIds.size > 0 && tableRows.length > 0
    && tableRows.every((t) => selectedIds.has(t.id)) && sorted.length > tableRows.length;

  return (
    <div>
      <RepositorySavedViewTabs
        currentSnapshot={{ filters: appliedFilters, quickFilter, sortKey, sortDir, groupByKey }}
        onApply={handleApplySavedView}
      />

      <RepositoryQuickFilters active={quickFilter} onSelect={setQuickFilter} />

      <RepositorySummaryBar
        tasks={searched}
        onSelectStatus={handleSelectStatus}
        onSelectOverdue={() => setQuickFilter('overdue')}
        onSelectTotal={handleSelectTotal}
      />

      <RepositoryActiveFilterPills
        filters={appliedFilters}
        quickFilter={quickFilter}
        onRemoveField={handleRemoveFilterField}
        onRemoveQuickFilter={() => setQuickFilter('all')}
        onClearAll={() => { handleClearAll(); setQuickFilter('all'); }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={loadSampleData}
          title="Adds demo tasks across all 5 categories — undo-able, doesn't remove existing tasks"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-jade/25 text-jade hover:bg-jade/10 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={groupByKey ?? ''}
            onChange={(e) => setGroupByKey(e.target.value ? (e.target.value as GroupByKey) : null)}
            className="text-xs font-semibold px-2.5 py-2 rounded-lg bg-noir-700 border border-white/[0.08] text-white/60 focus:outline-none focus:border-jade transition-colors"
          >
            <option value="">No Grouping</option>
            <option value="taskType">Group by Category</option>
            <option value="status">Group by Status</option>
            <option value="priority">Group by Priority</option>
            <option value="assignee">Group by Assignee</option>
          </select>

          <button
            type="button"
            onClick={() => setDateDisplayMode((m) => (m === 'relative' ? 'absolute' : 'relative'))}
            title="Toggle relative/absolute dates"
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
          >
            {dateDisplayMode === 'relative' ? 'Relative Dates' : 'Absolute Dates'}
          </button>

          <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
            {(['compact', 'default', 'comfortable'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                title={`${d[0].toUpperCase()}${d.slice(1)} density`}
                className={`text-[10px] font-bold px-2.5 py-2 transition-colors ${
                  density === d ? 'bg-jade/15 text-jade' : 'text-white/40 hover:text-white'
                }`}
              >
                {d === 'compact' ? 'S' : d === 'default' ? 'M' : 'L'}
              </button>
            ))}
          </div>

          <RepositoryColumnsMenu />
          <RepositoryExportMenu tasks={sorted} />

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {filterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-jade text-noir-800 text-[9px] font-bold rounded-full px-1">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showSelectAcrossPages && (
        <div className="mb-3 -mt-2">
          <button
            type="button"
            onClick={selectAllAcrossPages}
            className="text-[11px] font-semibold text-jade hover:text-jade-light transition-colors"
          >
            Select all {sorted.length} tasks across all pages
          </button>
        </div>
      )}

      <RepositoryTable
        tasks={tableRows}
        columns={columns}
        onColumnResize={setColumnWidth}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(id) => setConfirmDeleteId(id)}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAllOnPage={toggleSelectAllOnPage}
        density={density}
        dateDisplayMode={dateDisplayMode}
        groupByKey={groupByKey}
      />

      {!groupByKey && (
        <RepositoryPagination
          page={clampedPage}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <RepositoryFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={filterDraft}
        onDraftChange={(patch) => setFilterDraft((d) => ({ ...d, ...patch }))}
        onApply={handleApply}
        onReset={handleReset}
        onClearAll={handleClearAll}
        counts={counts}
      />

      <RepositoryBulkActionBar
        selectedIds={Array.from(selectedIds)}
        tasks={tasks}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {taskToDelete && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setConfirmDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-noir-700 border border-white/[0.08] rounded-xl p-5 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <h3 className="font-display font-bold text-sm text-white">Delete Task</h3>
              </div>
              <p className="text-xs text-white/50 mb-4">
                Delete "{taskToDelete.title}" permanently? This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { deleteTask(taskToDelete.id); setConfirmDeleteId(null); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Filter, AlertTriangle, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { RepositoryTable, RepoSortKey } from './RepositoryTable';
import { RepositoryFilterDrawer } from './RepositoryFilterDrawer';
import { RepositoryPagination } from './RepositoryPagination';
import { RepositoryFilters, EMPTY_REPOSITORY_FILTERS } from './repositoryFilterTypes';

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

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<RepositoryFilters>(EMPTY_REPOSITORY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RepositoryFilters>(EMPTY_REPOSITORY_FILTERS);
  const [sortKey, setSortKey] = useState<RepoSortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, appliedFilters, pageSize]);

  const searched = tasks.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.title.toLowerCase().includes(term) ||
      t.assignees.some((a) => a.toLowerCase().includes(term))
    );
  });

  const filtered = searched.filter((t) => {
    const f = appliedFilters;
    if (f.taskId && !t.id.toLowerCase().includes(f.taskId.toLowerCase())) return false;
    if (f.taskTitle && !t.title.toLowerCase().includes(f.taskTitle.toLowerCase())) return false;
    if (f.taskCategory && t.taskType !== f.taskCategory) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.assignee && !t.assignees.join(' ').toLowerCase().includes(f.assignee.toLowerCase())) return false;
    if (f.createdBy && !t.createdBy.toLowerCase().includes(f.createdBy.toLowerCase())) return false;
    if (f.createdFrom && new Date(t.createdAt) < new Date(f.createdFrom)) return false;
    if (f.createdTo && new Date(t.createdAt) > new Date(`${f.createdTo}T23:59:59`)) return false;
    if (f.dueFrom && new Date(t.dueDate) < new Date(f.dueFrom)) return false;
    if (f.dueTo && new Date(t.dueDate) > new Date(`${f.dueTo}T23:59:59`)) return false;
    return true;
  });

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

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const taskToDelete = confirmDeleteId ? tasks.find((t) => t.id === confirmDeleteId) : null;

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={loadSampleData}
          title="Adds demo tasks across all 5 categories — undo-able, doesn't remove existing tasks"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-jade/25 text-jade hover:bg-jade/10 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-jade text-noir-800 text-[9px] font-bold rounded-full px-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <RepositoryTable
        tasks={paginated}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(id) => setConfirmDeleteId(id)}
      />

      <RepositoryPagination
        page={clampedPage}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <RepositoryFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={filterDraft}
        onDraftChange={(patch) => setFilterDraft((d) => ({ ...d, ...patch }))}
        onApply={handleApply}
        onReset={handleReset}
        onClearAll={handleClearAll}
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

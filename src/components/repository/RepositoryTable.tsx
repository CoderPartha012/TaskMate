import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Task, Status, Priority } from '../../types';
import { TASK_TYPE_SHORT } from '../common/TaskTypeSelector';
import { RepoSortKey, ColumnConfig, GroupByKey, DateDisplayMode } from './repositoryColumnTypes';
import { formatRelativeDate, formatAbsoluteDate } from '../../utils/dateDisplay';
import { useTaskStore } from '../../store/taskStore';
import { useToastStore } from '../../store/toastStore';
import { RepositoryRowPreview } from './RepositoryRowPreview';
import { AssigneeAvatar } from '../common/analyticsShared';

interface RepositoryTableProps {
  tasks: Task[];
  columns: ColumnConfig[];
  onColumnResize: (key: RepoSortKey, width: number) => void;
  sortKey: RepoSortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: RepoSortKey) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAllOnPage: () => void;
  dateDisplayMode: DateDisplayMode;
  groupByKey: GroupByKey | null;
}

const priorityStyles: Record<string, string> = {
  high:   'bg-red-500/15   text-red-500   border border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  low:    'bg-jade/15      text-jade      border border-jade/20',
};

const statusStyles: Record<string, string> = {
  completed:    'bg-jade/15      text-jade',
  'in-progress': 'bg-blue-500/15 text-blue-500',
  pending:      'bg-white/[0.06] text-white/40',
};

const cellClass = 'px-4 py-3';
const headCellClass = 'px-4 py-3';
const rowTextClass = 'text-xs';

const GROUP_LABELS: Record<GroupByKey, (task: Task) => string> = {
  taskType: (t) => TASK_TYPE_SHORT[t.taskType],
  status: (t) => t.status.replace('-', ' '),
  priority: (t) => t.priority,
  assignee: (t) => (t.assignees.length > 0 ? t.assignees.join(', ') : 'Unassigned'),
};

function isOverdue(task: Task): boolean {
  return task.status !== 'completed' && new Date(task.dueDate) < new Date();
}

function formatDate(dateStr: string, mode: DateDisplayMode): string {
  return mode === 'relative' ? formatRelativeDate(dateStr) : formatAbsoluteDate(dateStr);
}

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
}

function ResizeHandle({ onResize }: ResizeHandleProps) {
  const startXRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      startXRef.current = moveEvent.clientX;
      onResize(delta);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-jade/40 transition-colors"
    />
  );
}

interface StatusCellProps {
  task: Task;
}

function StatusCell({ task }: StatusCellProps) {
  const updateTask = useTaskStore((s) => s.updateTask);

  const handleChange = (status: Status) => {
    if (status === task.status) return;
    updateTask(task.id, { status });
    useToastStore.getState().showToast({ message: `Status updated to ${status.replace('-', ' ')}` });
  };

  return (
    <select
      value={task.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => handleChange(e.target.value as Status)}
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap border-none focus:outline-none focus:ring-1 focus:ring-jade/50 cursor-pointer ${statusStyles[task.status]}`}
    >
      <option value="pending" className="bg-noir-700 text-white normal-case">Pending</option>
      <option value="in-progress" className="bg-noir-700 text-white normal-case">In Progress</option>
      <option value="completed" className="bg-noir-700 text-white normal-case">Completed</option>
    </select>
  );
}

interface PriorityCellProps {
  task: Task;
}

function PriorityCell({ task }: PriorityCellProps) {
  const updateTask = useTaskStore((s) => s.updateTask);

  const handleChange = (priority: Priority) => {
    if (priority === task.priority) return;
    updateTask(task.id, { priority });
    useToastStore.getState().showToast({ message: `Priority updated to ${priority}` });
  };

  return (
    <select
      value={task.priority}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => handleChange(e.target.value as Priority)}
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border-none focus:outline-none focus:ring-1 focus:ring-jade/50 cursor-pointer ${priorityStyles[task.priority]}`}
    >
      <option value="low" className="bg-noir-700 text-white normal-case">Low</option>
      <option value="medium" className="bg-noir-700 text-white normal-case">Medium</option>
      <option value="high" className="bg-noir-700 text-white normal-case">High</option>
    </select>
  );
}

export function RepositoryTable({
  tasks, columns, onColumnResize, sortKey, sortDir, onSort, onView, onEdit, onDelete,
  selectedIds, onToggleSelect, onToggleSelectAllOnPage, dateDisplayMode, groupByKey,
}: RepositoryTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [hoverTask, setHoverTask] = useState<Task | null>(null);
  const [hoverPos, setHoverPos] = useState({ top: 0, left: 0 });
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleColumns = columns.filter((c) => c.visible);
  const allOnPageSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        No tasks match the current search and filters.
      </div>
    );
  }

  const handleRowMouseEnter = (task: Task, e: React.MouseEvent<HTMLTableRowElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      setHoverTask(task);
      setHoverPos({ top: rect.top, left: Math.min(rect.right + 8, window.innerWidth - 300) });
    }, 500);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoverTask(null);
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const groups: { label: string; tasks: Task[] }[] = groupByKey
    ? Object.values(
        tasks.reduce<Record<string, { label: string; tasks: Task[] }>>((acc, t) => {
          const label = GROUP_LABELS[groupByKey](t);
          if (!acc[label]) acc[label] = { label, tasks: [] };
          acc[label].tasks.push(t);
          return acc;
        }, {})
      )
    : [{ label: '', tasks }];

  const visibleTasks = groupByKey
    ? groups.filter((g) => !collapsedGroups.has(g.label)).flatMap((g) => g.tasks)
    : tasks;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (visibleTasks.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, visibleTasks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      onView(visibleTasks[focusedIndex].id);
    } else if (e.key === 'Delete' && focusedIndex >= 0) {
      onDelete(visibleTasks[focusedIndex].id);
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1);
    }
  };

  function renderCell(task: Task, key: RepoSortKey) {
    switch (key) {
      case 'id':
        return <span className="font-mono" title={task.id}>{task.id.slice(0, 8)}</span>;
      case 'title':
        return <span className="font-semibold text-white/85 block truncate" title={task.title}>{task.title}</span>;
      case 'taskType':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/[0.12] text-white/55 uppercase tracking-wide whitespace-nowrap">
            {TASK_TYPE_SHORT[task.taskType]}
          </span>
        );
      case 'status':
        return <StatusCell task={task} />;
      case 'priority':
        return <PriorityCell task={task} />;
      case 'assignee':
        return task.assignees.length > 0 ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <AssigneeAvatar name={task.assignees[0]} size={18} />
            <span className="truncate">{task.assignees[0]}</span>
            {task.assignees.length > 1 && (
              <span className="text-white/30 shrink-0">+{task.assignees.length - 1}</span>
            )}
          </span>
        ) : (
          <span>—</span>
        );
      case 'createdBy':
        return <span className="whitespace-nowrap">{task.createdBy}</span>;
      case 'createdAt':
        return (
          <span className="whitespace-nowrap" title={formatAbsoluteDate(task.createdAt)}>
            {formatDate(task.createdAt, dateDisplayMode)}
          </span>
        );
      case 'dueDate':
        return (
          <span
            className={`whitespace-nowrap ${isOverdue(task) ? 'text-red-500 font-bold' : ''}`}
            title={formatAbsoluteDate(task.dueDate)}
          >
            {formatDate(task.dueDate, dateDisplayMode)}
          </span>
        );
      case 'lastModified':
        return (
          <span className="whitespace-nowrap" title={formatAbsoluteDate(task.lastModified)}>
            {formatDate(task.lastModified, dateDisplayMode)}
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="overflow-auto max-h-[calc(100vh-320px)] focus:outline-none"
    >
      <table className="w-full text-left border-collapse min-w-[1150px]">
        <thead className="sticky top-0 z-10 bg-noir-800">
          <tr className="border-b border-white/[0.06]">
            <th scope="col" className={`${headCellClass} w-8`}>
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={onToggleSelectAllOnPage}
                aria-label="Select all rows on this page"
                className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
              />
            </th>
            {visibleColumns.map(({ key, label, width }) => (
              <th key={key} scope="col" className="p-0 relative" style={{ width }}>
                <button
                  type="button"
                  onClick={() => onSort(key)}
                  className={`w-full flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 ${headCellClass} transition-colors whitespace-nowrap`}
                >
                  {label}
                  {sortKey === key ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </button>
                <ResizeHandle onResize={(delta) => onColumnResize(key, width + delta)} />
              </th>
            ))}
            <th scope="col" className={`text-[11px] font-semibold uppercase tracking-widest text-white/40 ${headCellClass} text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.label || 'ungrouped'}>
            {groupByKey && (
              <tr className="bg-noir-700/60">
                <td colSpan={visibleColumns.length + 2} className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                  >
                    {collapsedGroups.has(group.label) ? (
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    )}
                    {group.label} ({group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''})
                  </button>
                </td>
              </tr>
            )}
            {!collapsedGroups.has(group.label) && group.tasks.map((task) => {
              const overdue = isOverdue(task);
              const isSelected = selectedIds.has(task.id);
              const visibleIndex = visibleTasks.indexOf(task);
              const isFocused = visibleIndex === focusedIndex;

              return (
                <tr
                  key={task.id}
                  onMouseEnter={(e) => handleRowMouseEnter(task, e)}
                  onMouseLeave={handleRowMouseLeave}
                  onClick={() => setFocusedIndex(visibleIndex)}
                  className={`hover:bg-white/[0.03] transition-colors ${rowTextClass} ${
                    overdue ? 'bg-red-500/[0.04]' : ''
                  } ${isSelected ? 'bg-jade/[0.05]' : ''} ${isFocused ? 'ring-1 ring-inset ring-jade/50' : ''}`}
                >
                  <td className={cellClass}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select task ${task.title}`}
                      className="w-3.5 h-3.5 rounded accent-jade cursor-pointer"
                    />
                  </td>
                  {visibleColumns.map(({ key, width }) => (
                    <td key={key} className={`${cellClass} text-white/45`} style={{ width, maxWidth: width }}>
                      {renderCell(task, key)}
                    </td>
                  ))}
                  <td className={cellClass}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(task.id)}
                        title="View Task"
                        aria-label="View Task"
                        className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(task.id)}
                        title="Edit Task"
                        aria-label="Edit Task"
                        className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        title="Delete Task"
                        aria-label="Delete Task"
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>

      {hoverTask && <RepositoryRowPreview task={hoverTask} top={hoverPos.top} left={hoverPos.left} />}
    </div>
  );
}

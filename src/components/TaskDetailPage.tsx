import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, UserPlus, CheckCircle2, Trash2, Save, X, AlertTriangle, Copy } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { ActivityType, Status } from '../types';
import { TASK_TYPE_SHORT } from './TaskTypeSelector';
import { TaskGeneralInfo } from './TaskGeneralInfo';
import { TaskCategoryMetaSection } from './TaskCategoryMetaSection';
import { TaskAttachmentsSection } from './TaskAttachmentsSection';
import { TaskCommentsSection } from './TaskCommentsSection';
import { TaskActivityTimeline } from './TaskActivityTimeline';
import { TaskQuickSummarySidebar } from './TaskQuickSummarySidebar';
import { TaskSubtasksSection } from './TaskSubtasksSection';
import { TaskTimeTracker } from './TaskTimeTracker';
import { GeneralDraft } from './taskDetailTypes';
import { buildMetaDraft, buildMetaUpdate } from '../utils/metaDraft';

const statusBadgeStyles: Record<Status, string> = {
  completed: 'bg-jade/15 text-jade',
  'in-progress': 'bg-blue-500/15 text-blue-400',
  pending: 'bg-white/5 text-white/40',
};

const inputBase =
  'rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors w-full';

interface NewEntry {
  type: ActivityType;
  message: string;
  user: string;
}

interface TaskDetailPageProps {
  taskId: string | null;
}

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const setActiveSection = useTaskStore((s) => s.setActiveSection);
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const editOnOpen = useTaskStore((s) => s.editOnOpen);
  const setEditOnOpen = useTaskStore((s) => s.setEditOnOpen);

  const task = tasks.find((t) => t.id === taskId);

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [generalDraft, setGeneralDraft] = useState<GeneralDraft | null>(null);
  const [metaDraft, setMetaDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editOnOpen && task) {
      setTitleDraft(task.title);
      setDescriptionDraft(task.description);
      setGeneralDraft({
        assignee: task.assignees.join(', '),
        priority: task.priority,
        status: task.status,
        startDate: task.startDate ?? '',
        dueDate: task.dueDate,
        category: task.category,
      });
      setMetaDraft(buildMetaDraft(task));
      setEditing(true);
      setEditOnOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOnOpen, task?.id]);

  const goBack = () => {
    setActiveSection('repository');
    setViewingTaskId(null);
  };

  if (!task) {
    return (
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-10 text-center">
        <p className="text-sm text-white/50 mb-4">This task could not be found.</p>
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade hover:text-jade-light transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Repository
        </button>
      </div>
    );
  }

  const startEditing = () => {
    setTitleDraft(task.title);
    setDescriptionDraft(task.description);
    setGeneralDraft({
      assignee: task.assignees.join(', '),
      priority: task.priority,
      status: task.status,
      startDate: task.startDate ?? '',
      dueDate: task.dueDate,
      category: task.category,
    });
    setMetaDraft(buildMetaDraft(task));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setGeneralDraft(null);
    setMetaDraft({});
  };

  const handleGeneralChange = (patch: Partial<GeneralDraft>) => {
    setGeneralDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const handleMetaChange = (key: string, value: string) => {
    setMetaDraft((m) => ({ ...m, [key]: value }));
  };

  const handleSave = () => {
    if (!generalDraft) return;

    const newAssignees = generalDraft.assignee.split(',').map((s) => s.trim()).filter(Boolean);
    const metaUpdate = buildMetaUpdate(task, metaDraft);
    const entries: NewEntry[] = [];

    if (titleDraft.trim() && titleDraft.trim() !== task.title) {
      entries.push({ type: 'metadata_updated', message: `Title changed to "${titleDraft.trim()}"`, user: 'You' });
    }
    if (generalDraft.status !== task.status) {
      entries.push({
        type: 'status_changed',
        message: `Status changed from ${task.status.replace('-', ' ')} to ${generalDraft.status.replace('-', ' ')}`,
        user: 'You',
      });
    }
    const newAssigneeText = newAssignees.join(', ');
    if (newAssigneeText !== task.assignees.join(', ')) {
      entries.push({
        type: 'assigned',
        message: newAssigneeText ? `Assigned to ${newAssigneeText}` : 'Unassigned',
        user: 'You',
      });
    }
    if (generalDraft.dueDate !== task.dueDate) {
      const d = new Date(generalDraft.dueDate);
      entries.push({
        type: 'due_date_changed',
        message: `Due date changed to ${Number.isNaN(d.getTime()) ? generalDraft.dueDate : format(d, 'MMM d, yyyy')}`,
        user: 'You',
      });
    }

    if (task.taskType === 'workflow') {
      const oldStage = task.workflowMeta?.currentStage ?? '';
      const newStage = metaDraft.currentStage ?? '';
      if (newStage !== oldStage) {
        entries.push({ type: 'workflow_stage_changed', message: `Workflow stage changed to "${newStage}"`, user: 'You' });
      }
    }
    if (task.taskType === 'contract') {
      const oldCompliance = task.contractMeta?.complianceStatus ?? '';
      const newCompliance = metaDraft.complianceStatus ?? '';
      const oldSignatory = task.contractMeta?.signatory ?? '';
      const newSignatory = metaDraft.signatory ?? '';
      if ((newCompliance === 'Compliant' && oldCompliance !== 'Compliant') || (newSignatory && !oldSignatory)) {
        entries.push({ type: 'contract_signed', message: 'Contract approved / signed', user: 'You' });
      }
    }

    const priorityChanged = generalDraft.priority !== task.priority;
    const categoryChanged = generalDraft.category !== task.category;
    const startDateChanged = (generalDraft.startDate || undefined) !== task.startDate;
    const descriptionChanged = descriptionDraft !== task.description;
    const metaChanged = JSON.stringify(metaDraft) !== JSON.stringify(buildMetaDraft(task));
    if (priorityChanged || categoryChanged || startDateChanged || descriptionChanged || metaChanged) {
      entries.push({ type: 'metadata_updated', message: 'Task details updated', user: 'You' });
    }

    updateTask(
      task.id,
      {
        title: titleDraft.trim() || task.title,
        description: descriptionDraft,
        assignees: newAssignees,
        priority: generalDraft.priority,
        status: generalDraft.status,
        startDate: generalDraft.startDate || undefined,
        dueDate: generalDraft.dueDate,
        category: generalDraft.category,
        ...metaUpdate,
      },
      entries
    );

    setEditing(false);
  };

  const handleComplete = () => {
    if (task.status === 'completed') return;
    updateTask(
      task.id,
      { status: 'completed', completedAt: new Date().toISOString() },
      [{ type: 'status_changed', message: 'Marked as completed', user: 'You' }]
    );
  };

  const handleDelete = () => {
    deleteTask(task.id);
    goBack();
  };

  const handleStatusChange = (newStatus: Status) => {
    if (newStatus === task.status) return;
    updateTask(
      task.id,
      { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : task.completedAt },
      [{
        type: 'status_changed',
        message: `Status changed from ${task.status.replace('-', ' ')} to ${newStatus.replace('-', ' ')}`,
        user: 'You',
      }]
    );
  };

  const handleDuplicate = () => {
    const newId = duplicateTask(task.id);
    if (!newId) return;
    setViewingTaskId(newId);
    setActiveSection('task-detail');
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 mb-6">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white/35 hover:text-jade transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Repository
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-white/30" title={task.id}>#{task.id.slice(0, 8)}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 uppercase tracking-wide">
                {TASK_TYPE_SHORT[task.taskType]}
              </span>
              <select
                aria-label="Task status"
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                className={`text-[10px] font-bold pl-2 pr-1.5 py-0.5 rounded-full uppercase tracking-wide border-none focus:outline-none focus:ring-1 focus:ring-jade/50 cursor-pointer ${statusBadgeStyles[task.status]}`}
              >
                <option value="pending" className="bg-noir-700 text-white normal-case">Pending</option>
                <option value="in-progress" className="bg-noir-700 text-white normal-case">In Progress</option>
                <option value="completed" className="bg-noir-700 text-white normal-case">Completed</option>
              </select>
            </div>

            {editing ? (
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Task title"
                aria-label="Task title"
                className={`${inputBase} font-display font-bold text-lg mb-2`}
              />
            ) : (
              <h1 className="font-display font-bold text-lg text-white mb-2">{task.title}</h1>
            )}

            {editing ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                rows={2}
                placeholder="Task description"
                className={`${inputBase} resize-none`}
              />
            ) : (
              task.description && <p className="text-xs text-white/45 leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!editing && (
              <>
                <button type="button" onClick={startEditing} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Task
                </button>
                <button type="button" onClick={startEditing} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                  Assign
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={task.status === 'completed'}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Task
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate Task
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
              </>
            )}
          </div>
        </div>

        {confirmingDelete && (
          <div className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300 flex-1">Delete this task permanently? This cannot be undone.</p>
            <button type="button" onClick={handleDelete} className="text-xs font-bold px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmingDelete(false)} className="text-xs font-semibold px-3 py-1 rounded-lg border border-white/[0.1] text-white/50 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Two-column layout: main content + sticky sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <TaskGeneralInfo
            task={task}
            editing={editing}
            draft={generalDraft ?? {
              assignee: task.assignees.join(', '),
              priority: task.priority,
              status: task.status,
              startDate: task.startDate ?? '',
              dueDate: task.dueDate,
              category: task.category,
            }}
            onChange={handleGeneralChange}
          />
          <TaskTimeTracker task={task} />
          <TaskSubtasksSection task={task} />
          <TaskCategoryMetaSection
            task={task}
            editing={editing}
            metaDraft={metaDraft}
            onMetaChange={handleMetaChange}
          />
          <TaskAttachmentsSection task={task} />
          <TaskCommentsSection task={task} />
          <TaskActivityTimeline task={task} />
        </div>

        <TaskQuickSummarySidebar task={task} />
      </div>

      {/* Bottom action bar */}
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl mt-6 px-5 py-3 flex flex-wrap justify-end gap-3">
        {editing ? (
          <>
            <button type="button" onClick={cancelEditing} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleComplete}
              disabled={task.status === 'completed'}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete Task
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Task
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, CheckCircle2, Trash2, Save, X, Copy, MoreHorizontal,
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { ActivityType, Priority, Status } from '../../types';
import { TASK_TYPE_SHORT } from '../common/TaskTypeSelector';
import { TaskDetailTabs, TaskDetailTabKey } from './TaskDetailTabs';
import { TaskDetailsTab } from './TaskDetailsTab';
import { TaskSubtasksSection } from './TaskSubtasksSection';
import { TaskCommentsSection } from './TaskCommentsSection';
import { TaskRelatedTasksSection } from './TaskRelatedTasksSection';
import { TaskDocumentsTab } from './TaskDocumentsTab';
import { TaskLogsTab } from './TaskLogsTab';
import { TaskObligationsTab } from './TaskObligationsTab';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { GeneralDraft } from './taskDetailTypes';
import { buildMetaDraft, buildMetaUpdate } from '../../utils/metaDraft';

const statusBadgeStyles: Record<Status, string> = {
  completed: 'bg-jade/15 text-jade',
  'in-progress': 'bg-blue-500/15 text-blue-500',
  pending: 'bg-white/[0.06] text-white/40',
};

const priorityBadgeStyles: Record<Priority, string> = {
  high: 'bg-red-500/15 text-red-500',
  medium: 'bg-amber-500/15 text-amber-500',
  low: 'bg-jade/15 text-jade',
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
  const pendingTaskDetailTab = useTaskStore((s) => s.pendingTaskDetailTab);
  const setPendingTaskDetailTab = useTaskStore((s) => s.setPendingTaskDetailTab);

  const task = tasks.find((t) => t.id === taskId);

  const [activeTab, setActiveTab] = useState<TaskDetailTabKey>('details');
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [generalDraft, setGeneralDraft] = useState<GeneralDraft | null>(null);
  const [metaDraft, setMetaDraft] = useState<Record<string, string>>({});
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setOverflowOpen(false);
    }
    if (overflowOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [overflowOpen]);

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
      setActiveTab('details');
      setEditOnOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOnOpen, task?.id]);

  useEffect(() => {
    if (pendingTaskDetailTab && task) {
      setActiveTab(pendingTaskDetailTab);
      setPendingTaskDetailTab(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTaskDetailTab, task?.id]);

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
    setActiveTab('details');
    setOverflowOpen(false);
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
    setOverflowOpen(false);
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
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

  const handlePriorityChange = (newPriority: Priority) => {
    if (newPriority === task.priority) return;
    updateTask(
      task.id,
      { priority: newPriority },
      [{ type: 'metadata_updated', message: `Priority changed to ${newPriority}`, user: 'You' }]
    );
  };

  const handleDuplicate = () => {
    const newId = duplicateTask(task.id);
    setOverflowOpen(false);
    if (!newId) return;
    setViewingTaskId(newId);
    setActiveSection('task-detail');
  };

  const generalDraftValue: GeneralDraft = generalDraft ?? {
    assignee: task.assignees.join(', '),
    priority: task.priority,
    status: task.status,
    startDate: task.startDate ?? '',
    dueDate: task.dueDate,
    category: task.category,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white/35 hover:text-jade transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Repository
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-white/30 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1" title={task.id}>
              #{task.id.slice(0, 8)}
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md border border-white/[0.12] text-white/50 uppercase tracking-wide">
              {TASK_TYPE_SHORT[task.taskType]}
            </span>
            <select
              aria-label="Task status"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Status)}
              className={`text-[10px] font-bold pl-2 pr-1.5 py-1 rounded-full uppercase tracking-wide border-none focus:outline-none focus:ring-1 focus:ring-jade/50 cursor-pointer ${statusBadgeStyles[task.status]}`}
            >
              <option value="pending" className="bg-noir-700 text-white normal-case">Pending</option>
              <option value="in-progress" className="bg-noir-700 text-white normal-case">In Progress</option>
              <option value="completed" className="bg-noir-700 text-white normal-case">Completed</option>
            </select>
            <select
              aria-label="Task priority"
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as Priority)}
              className={`text-[10px] font-bold pl-2 pr-1.5 py-1 rounded-full uppercase tracking-wide border-none focus:outline-none focus:ring-1 focus:ring-jade/50 cursor-pointer ${priorityBadgeStyles[task.priority]}`}
            >
              <option value="low" className="bg-noir-700 text-white normal-case">Low</option>
              <option value="medium" className="bg-noir-700 text-white normal-case">Medium</option>
              <option value="high" className="bg-noir-700 text-white normal-case">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!editing && (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Task
                </button>
                <div ref={overflowRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOverflowOpen((v) => !v)}
                    aria-label="More actions"
                    className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {overflowOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={handleComplete}
                        disabled={task.status === 'completed'}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-jade" />
                        Complete Task
                      </button>
                      <button
                        type="button"
                        onClick={handleDuplicate}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        Duplicate Task
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConfirmingDelete(true); setOverflowOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Task
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Task title"
            aria-label="Task title"
            className={`${inputBase} font-display font-bold text-2xl`}
          />
        ) : (
          <h1 className="font-display font-bold text-3xl text-white">{task.title}</h1>
        )}

        {confirmingDelete && (
          <ConfirmDeleteModal
            title="Delete Task"
            message={`Delete "${task.title}" permanently? This cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </div>

      <TaskDetailTabs active={activeTab} onSelect={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'details' && (
            <TaskDetailsTab
              task={task}
              editing={editing}
              generalDraft={generalDraftValue}
              descriptionDraft={editing ? descriptionDraft : task.description}
              metaDraft={metaDraft}
              onGeneralChange={handleGeneralChange}
              onDescriptionChange={setDescriptionDraft}
              onMetaChange={handleMetaChange}
            />
          )}
          {activeTab === 'subtasks' && <TaskSubtasksSection task={task} />}
          {activeTab === 'comments' && <TaskCommentsSection task={task} />}
          {activeTab === 'related' && <TaskRelatedTasksSection task={task} />}
          {activeTab === 'documents' && <TaskDocumentsTab task={task} />}
          {activeTab === 'logs' && <TaskLogsTab task={task} />}
          {activeTab === 'obligations' && <TaskObligationsTab task={task} />}
        </motion.div>
      </AnimatePresence>

      {editing && activeTab === 'details' && (
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl mt-6 px-5 py-3 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={cancelEditing} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors">
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

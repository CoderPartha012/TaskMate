import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, ChevronRight, CheckCircleIcon, Clock, AlertTriangle } from 'lucide-react';
import { Priority, Category, RecurrencePattern, Status, TaskType, TaskAttachment } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useDraftStore } from '../store/draftStore';
import { useToastStore } from '../store/toastStore';
import { TaskDraft } from '../types/draft.types';
import { DraftFormData, hasMeaningfulData, computeCompletionPercent, convertDraftCategory } from '../utils/draftFormData';
import { TaskCategoryOverview, TASK_TYPE_LABELS } from './TaskTypeSelector';
import { TaskCategoryTabs } from './TaskCategoryTabs';
import { DraftsSection } from './DraftsSection';
import { MetaFieldGroup } from './MetaFieldGroup';
import { AttachmentsField } from './AttachmentsField';
import {
  WORKFLOW_FIELDS,
  PROJECT_FIELDS,
  AI_FIELDS,
  AI_OUTPUT_FIELDS,
  CONTRACT_FIELDS,
} from './metaFieldConfigs';

const MAX_DRAFTS = 10;

type Errors = {
  title: string;
  dueDate: string;
  priority: string;
  category: string;
  prompt: string;
};

const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none transition-colors placeholder:text-white/25';
const selectBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none transition-colors';
const borderNormal = 'border border-white/[0.08] focus:border-jade';
const borderError  = 'border border-red-500/60 focus:border-red-500';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-widest text-white/40';
const req = <span className="text-priority-high" aria-hidden="true">*</span>;

const TITLE_LABELS: Record<TaskType, string> = {
  general: 'Task Name',
  workflow: 'Workflow Name',
  project: 'Project Name',
  ai: 'Task Title',
  contract: 'Task Title',
};

const SHOWS_DUE_DATE: TaskType[]  = ['general', 'workflow', 'project'];
const SHOWS_PRIORITY: TaskType[]  = ['general', 'project'];
const SHOWS_STATUS: TaskType[]    = ['general', 'workflow', 'project', 'contract'];
const SHOWS_ASSIGNEE: TaskType[]  = ['general', 'workflow', 'project'];

const ASSIGNEE_LABEL: Partial<Record<TaskType, string>> = {
  project: 'Task Owner',
};

function splitList(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

function generateContractId(): string {
  return `CTR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getDueDateAdvisory(dateStr: string): string | null {
  if (!dateStr) return null;
  const due = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due < today) return 'This due date is in the past.';
  const day = due.getDay();
  if (day === 0 || day === 6) return 'Heads up — this falls on a weekend.';
  return null;
}

export function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const setActiveSection = useTaskStore((state) => state.setActiveSection);
  const setViewingTaskId = useTaskStore((state) => state.setViewingTaskId);

  const [taskType, setTaskType] = useState<TaskType | null>(null);

  // Shared fields
  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [dueDate,       setDueDate]       = useState('');
  const [priority,      setPriority]      = useState<Priority | ''>('');
  const [category,      setCategory]      = useState<Category | ''>('');
  const [status,        setStatus]        = useState<Status>('pending');
  const [assignee,      setAssignee]      = useState('');
  const [recurrence,    setRecurrence]    = useState<RecurrencePattern>('none');
  const [estimatedTime, setEstimatedTime] = useState('');

  // General-only extras
  const [startDate,   setStartDate]   = useState('');
  const [tags,        setTags]        = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [initialComment, setInitialComment] = useState('');

  // Generic string dict for workflow/project/ai/contract fields
  const [meta, setMeta] = useState<Record<string, string>>({});
  const setMetaField = (key: string, value: string) => setMeta((m) => ({ ...m, [key]: value }));

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({ title: '', dueDate: '', priority: '', category: '', prompt: '' });

  const [pendingSwitch, setPendingSwitch] = useState<TaskType | null>(null);

  // Drafts
  const drafts = useDraftStore((s) => s.drafts);
  const saveDraftAction = useDraftStore((s) => s.saveDraft);
  const deleteDraftAction = useDraftStore((s) => s.deleteDraft);

  const [currentDraft, setCurrentDraft] = useState<{ id: string; createdAt: string } | null>(null);
  const [resumingDraft, setResumingDraft] = useState<{ lastModified: string; hadAttachments: boolean } | null>(null);
  const [existingDraftPrompt, setExistingDraftPrompt] = useState<TaskDraft | null>(null);

  const buildSnapshot = (): DraftFormData => ({
    title, description, dueDate, priority, category, status, assignee,
    recurrence, estimatedTime, startDate, tags,
    attachments: attachments.map((a) => ({ name: a.name, type: a.type, size: a.size })),
    initialComment, meta,
  });

  const taskTypeRef = useRef(taskType);
  const currentDraftRef = useRef(currentDraft);
  const draftsRef = useRef(drafts);
  const snapshotRef = useRef<DraftFormData>(buildSnapshot());

  useEffect(() => {
    taskTypeRef.current = taskType;
    currentDraftRef.current = currentDraft;
    draftsRef.current = drafts;
    snapshotRef.current = buildSnapshot();
  });

  const trySaveDraft = (source: 'interval' | 'unmount' | 'switch' | 'changeCategory'): string | null => {
    const type = taskTypeRef.current;
    const snapshot = snapshotRef.current;
    const existingDraft = currentDraftRef.current;

    if (!type) return null;
    if (!hasMeaningfulData(snapshot)) return null;
    if (!existingDraft && draftsRef.current.length >= MAX_DRAFTS) return null;

    const now = new Date().toISOString();
    const id = existingDraft?.id ?? `draft-${Date.now()}`;
    const createdAt = existingDraft?.createdAt ?? now;

    saveDraftAction({
      id,
      category: type,
      formData: snapshot,
      createdAt,
      lastModified: now,
      completionPercent: computeCompletionPercent(type, snapshot),
    });

    if (!existingDraft) {
      currentDraftRef.current = { id, createdAt };
      if (source !== 'unmount') setCurrentDraft({ id, createdAt });
    }

    useToastStore.getState().showToast({
      message: source === 'unmount' ? 'Draft saved automatically' : 'Draft saved',
    });

    return id;
  };

  useEffect(() => {
    const interval = setInterval(() => trySaveDraft('interval'), 30000);
    return () => {
      clearInterval(interval);
      trySaveDraft('unmount');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumeDraft = (draft: TaskDraft) => {
    const data = draft.formData as DraftFormData;
    setTaskType(draft.category);
    setTitle(data.title);
    setDescription(data.description);
    setDueDate(data.dueDate);
    setPriority(data.priority);
    setCategory(data.category);
    setStatus(data.status);
    setAssignee(data.assignee);
    setRecurrence(data.recurrence);
    setEstimatedTime(data.estimatedTime);
    setStartDate(data.startDate);
    setTags(data.tags);
    setAttachments([]);
    setInitialComment(data.initialComment);
    setMeta(data.meta);
    setSubmitted(false);
    setErrors({ title: '', dueDate: '', priority: '', category: '', prompt: '' });

    setCurrentDraft({ id: draft.id, createdAt: draft.createdAt });
    currentDraftRef.current = { id: draft.id, createdAt: draft.createdAt };
    setResumingDraft({ lastModified: draft.lastModified, hadAttachments: data.attachments.length > 0 });
    setExistingDraftPrompt(null);
    setPendingSwitch(null);
  };

  const handleDeleteDraftFromList = (draft: TaskDraft) => {
    deleteDraftAction(draft.id);
    useToastStore.getState().showToast({
      message: 'Draft deleted',
      duration: 5000,
      actionLabel: 'Undo',
      onAction: () => saveDraftAction(draft),
    });
  };

  const handleConvertDraft = (draft: TaskDraft, newCategory: TaskType) => {
    saveDraftAction(convertDraftCategory(draft, newCategory));
    useToastStore.getState().showToast({ message: 'Draft saved' });
  };

  if (taskType === null) {
    return (
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6 mb-6">
        <h2 className="font-display font-bold text-base text-white mb-5 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-jade" aria-hidden="true" />
          Add New Task
        </h2>
        {drafts.length >= MAX_DRAFTS && (
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-4 py-2.5 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              You've reached the maximum of 10 drafts. Please complete or delete a draft before starting a new task.
            </p>
          </div>
        )}
        <TaskCategoryOverview onSelect={setTaskType} />
        <DraftsSection onResume={handleResumeDraft} onDelete={handleDeleteDraftFromList} onConvert={handleConvertDraft} />
      </div>
    );
  }

  const validate = (): Errors => ({
    title:    !title.trim() ? 'Title is required' : '',
    dueDate:  SHOWS_DUE_DATE.includes(taskType) && !dueDate ? 'Due date is required' : '',
    priority: SHOWS_PRIORITY.includes(taskType) && !priority ? 'Please select a priority' : '',
    category: taskType === 'general' && !category ? 'Please select a category' : '',
    prompt:   taskType === 'ai' && !meta.prompt?.trim() ? 'Prompt is required' : '',
  });

  const resetForm = () => {
    setTitle(''); setDescription(''); setDueDate('');
    setPriority(''); setCategory(''); setStatus('pending'); setAssignee('');
    setRecurrence('none'); setEstimatedTime('');
    setStartDate(''); setTags(''); setAttachments([]); setInitialComment('');
    setMeta({});
    setSubmitted(false);
    setErrors({ title: '', dueDate: '', priority: '', category: '', prompt: '' });
    setCurrentDraft(null);
    currentDraftRef.current = null;
    setResumingDraft(null);
    setExistingDraftPrompt(null);
  };

  const handleChangeCategory = () => {
    trySaveDraft('changeCategory');
    resetForm();
    setTaskType(null);
  };

  const handleDiscardDraft = () => {
    if (currentDraft) deleteDraftAction(currentDraft.id);
    resetForm();
    setTaskType(null);
  };

  const hasCategorySpecificData = () => {
    const metaFilled = Object.values(meta).some((v) => v.trim() !== '');
    if (taskType === 'general') {
      return metaFilled || !!startDate || !!tags.trim() || attachments.length > 0 || !!initialComment.trim();
    }
    return metaFilled;
  };

  const commitSwitch = (newType: TaskType) => {
    trySaveDraft('switch');
    setMeta({});
    setStartDate(''); setTags(''); setAttachments([]); setInitialComment('');
    setTaskType(newType);
    setPendingSwitch(null);
    setSubmitted(false);
    setErrors({ title: '', dueDate: '', priority: '', category: '', prompt: '' });
    setCurrentDraft(null);
    currentDraftRef.current = null;
    setResumingDraft(null);
    setExistingDraftPrompt(drafts.find((d) => d.category === newType) ?? null);
  };

  const handleSwitchCategory = (newType: TaskType) => {
    if (newType === taskType) return;
    if (hasCategorySpecificData()) {
      setPendingSwitch(newType);
    } else {
      commitSwitch(newType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const today = new Date().toISOString().slice(0, 10);
    const assignees = SHOWS_ASSIGNEE.includes(taskType) ? splitList(assignee) : [];

    const newTaskId = addTask({
      title: title.trim(),
      description: taskType === 'general' ? description : '',
      startDate: taskType === 'general' ? (startDate || undefined) : undefined,
      dueDate: SHOWS_DUE_DATE.includes(taskType) ? dueDate : (meta.effectiveDate || today),
      priority: SHOWS_PRIORITY.includes(taskType) ? (priority as Priority) : 'medium',
      status: SHOWS_STATUS.includes(taskType) ? status : 'pending',
      category: taskType === 'general' ? (category as Category) : 'other',
      recurrence: taskType === 'general' ? recurrence : 'none',
      estimatedTime: taskType === 'general' && estimatedTime ? parseInt(estimatedTime, 10) : undefined,
      dependencies: taskType === 'project' ? splitList(meta.dependencies || '') : [],
      assignees,
      sharedLink: undefined,
      taskType,
      attachments: taskType === 'general' ? attachments : [],
      initialComment: taskType === 'general' ? initialComment : undefined,
      generalMeta: taskType === 'general' ? {
        tags: splitList(tags),
      } : undefined,
      workflowMeta: taskType === 'workflow' ? {
        currentStage: meta.currentStage || '',
        nextStage: meta.nextStage || '',
        reviewer: meta.reviewer || '',
        approver: meta.approver || '',
        approvalLevel: meta.approvalLevel || '',
        triggerCondition: meta.triggerCondition || '',
        slaHours: meta.slaHours ? parseFloat(meta.slaHours) : undefined,
        escalationRule: meta.escalationRule || '',
      } : undefined,
      projectMeta: taskType === 'project' ? {
        epic: meta.epic || '',
        sprint: meta.sprint || '',
        milestone: meta.milestone || '',
        team: meta.team || '',
        storyPoints: meta.storyPoints ? parseFloat(meta.storyPoints) : undefined,
        estimatedHours: meta.estimatedHours ? parseFloat(meta.estimatedHours) : undefined,
        actualHours: meta.actualHours ? parseFloat(meta.actualHours) : undefined,
        progressPercent: meta.progressPercent ? parseFloat(meta.progressPercent) : 0,
      } : undefined,
      aiMeta: taskType === 'ai' ? {
        model: meta.model || '',
        prompt: meta.prompt?.trim() || '',
        inputSource: meta.inputSource || '',
        outputType: meta.outputType || '',
        trigger: meta.trigger || '',
        automationRule: meta.automationRule || '',
        confidenceThreshold: meta.confidenceThreshold ? parseFloat(meta.confidenceThreshold) : undefined,
        retryPolicy: meta.retryPolicy || '',
        schedule: meta.schedule || '',
        executionStatus: 'idle',
        result: '',
        logs: [],
      } : undefined,
      contractMeta: taskType === 'contract' ? {
        contractId: meta.contractId?.trim() || generateContractId(),
        contractType: meta.contractType || '',
        template: meta.template || '',
        requestor: meta.requestor || '',
        businessUnit: meta.businessUnit || '',
        counterparty: meta.counterparty || '',
        reviewer: meta.reviewer || '',
        approver: meta.approver || '',
        signatory: meta.signatory || '',
        effectiveDate: meta.effectiveDate || '',
        expiryDate: meta.expiryDate || '',
        renewalDate: meta.renewalDate || '',
        complianceStatus: meta.complianceStatus || '',
        workflowStage: meta.workflowStage || '',
        documentVersion: meta.documentVersion || '',
      } : undefined,
    });

    if (currentDraft) deleteDraftAction(currentDraft.id);
    resetForm();
    setViewingTaskId(newTaskId);
    setActiveSection('task-detail');
  };

  const err = (key: keyof Errors) => submitted && errors[key];

  return (
    <form onSubmit={handleSubmit} className="bg-noir-700 border border-white/[0.06] rounded-xl p-6 mb-6" noValidate>
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/35 mb-3">
          <button
            type="button"
            onClick={handleChangeCategory}
            className="flex items-center gap-1 hover:text-jade transition-colors"
          >
            <CheckCircleIcon className="w-3.5 h-3.5 text-jade" aria-hidden="true" />
            Add New Task
          </button>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span className="text-white/60">{TASK_TYPE_LABELS[taskType]}</span>
        </div>

        <TaskCategoryTabs active={taskType} onSelect={handleSwitchCategory} />

        {pendingSwitch && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-4 py-2.5 mt-1">
            <p className="text-[11px] text-amber-300/90 leading-relaxed flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Switching will clear {TASK_TYPE_LABELS[taskType]}-specific fields. Common fields will be kept.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPendingSwitch(null)}
                className="text-[11px] font-semibold text-white/45 hover:text-white/70 transition-colors px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => commitSwitch(pendingSwitch)}
                className="text-[11px] font-bold text-noir-800 bg-amber-400 hover:bg-amber-300 rounded-md px-2.5 py-1 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {resumingDraft && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-500/25 bg-blue-500/[0.08] px-4 py-2.5 mt-1">
            <p className="text-[11px] text-blue-300/90 leading-relaxed">
              📝 Resuming draft from {formatDistanceToNow(new Date(resumingDraft.lastModified), { addSuffix: true })}
              {resumingDraft.hadAttachments && ' — attachments were not saved with this draft. Please re-upload them.'}
            </p>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-[11px] font-semibold text-blue-300/80 hover:text-blue-200 transition-colors shrink-0 whitespace-nowrap"
            >
              Discard draft
            </button>
          </div>
        )}

        {existingDraftPrompt && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-500/25 bg-blue-500/[0.08] px-4 py-2.5 mt-1">
            <p className="text-[11px] text-blue-300/90 leading-relaxed">
              You have an existing draft for {TASK_TYPE_LABELS[existingDraftPrompt.category]}. Resume it or start fresh?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setExistingDraftPrompt(null)}
                className="text-[11px] font-semibold text-white/45 hover:text-white/70 transition-colors px-2 py-1"
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={() => handleResumeDraft(existingDraftPrompt)}
                className="text-[11px] font-bold text-noir-800 bg-blue-400 hover:bg-blue-300 rounded-md px-2.5 py-1 transition-colors"
              >
                Resume Draft
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Title (relabeled per category) */}
        <div>
          <label htmlFor="task-title" className={labelClass}>
            {TITLE_LABELS[taskType]} {req}
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Enter ${TITLE_LABELS[taskType].toLowerCase()}`}
            aria-required="true"
            aria-describedby={err('title') ? 'err-title' : undefined}
            className={`${inputBase} ${err('title') ? borderError : borderNormal}`}
          />
          {err('title') && (
            <p id="err-title" role="alert" className="mt-1 text-[10px] text-red-400">{errors.title}</p>
          )}
        </div>

        <AnimatePresence mode="wait">
        <motion.div
          key={taskType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >

        {taskType === 'general' && (
          <div>
            <label htmlFor="task-desc" className={labelClass}>Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter task description"
              className={`${inputBase} ${borderNormal} resize-none`}
            />
          </div>
        )}

        {(SHOWS_DUE_DATE.includes(taskType) || SHOWS_PRIORITY.includes(taskType)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHOWS_DUE_DATE.includes(taskType) && (
              <div>
                <label htmlFor="task-due" className={labelClass}>
                  Due Date {req}
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <input
                    id="task-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    aria-required="true"
                    aria-describedby={err('dueDate') ? 'err-due' : undefined}
                    className={`${inputBase} pl-9 ${err('dueDate') ? borderError : borderNormal}`}
                  />
                </div>
                {err('dueDate') && (
                  <p id="err-due" role="alert" className="mt-1 text-[10px] text-red-400">{errors.dueDate}</p>
                )}
                {!err('dueDate') && getDueDateAdvisory(dueDate) && (
                  <p className="mt-1 text-[10px] text-amber-400/80 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {getDueDateAdvisory(dueDate)}
                  </p>
                )}
              </div>
            )}

            {SHOWS_PRIORITY.includes(taskType) && (
              <div>
                <label htmlFor="task-priority" className={labelClass}>
                  Priority {req}
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority | '')}
                  aria-required="true"
                  aria-describedby={err('priority') ? 'err-priority' : undefined}
                  className={`${selectBase} ${err('priority') ? borderError : borderNormal}`}
                >
                  <option value="" disabled>— Select priority —</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {err('priority') && (
                  <p id="err-priority" role="alert" className="mt-1 text-[10px] text-red-400">{errors.priority}</p>
                )}
              </div>
            )}
          </div>
        )}

        {(taskType === 'general' || SHOWS_ASSIGNEE.includes(taskType) || SHOWS_STATUS.includes(taskType)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskType === 'general' && (
              <div>
                <label htmlFor="task-category" className={labelClass}>
                  Category {req}
                </label>
                <select
                  id="task-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | '')}
                  aria-required="true"
                  aria-describedby={err('category') ? 'err-category' : undefined}
                  className={`${selectBase} ${err('category') ? borderError : borderNormal}`}
                >
                  <option value="" disabled>— Select category —</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="urgent">Urgent</option>
                  <option value="other">Other</option>
                </select>
                {err('category') && (
                  <p id="err-category" role="alert" className="mt-1 text-[10px] text-red-400">{errors.category}</p>
                )}
              </div>
            )}

            {SHOWS_ASSIGNEE.includes(taskType) && (
              <div>
                <label htmlFor="task-assignee" className={labelClass}>
                  {ASSIGNEE_LABEL[taskType] ?? 'Assignee'}
                </label>
                <input
                  id="task-assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Name or email"
                  className={`${inputBase} ${borderNormal}`}
                />
              </div>
            )}

            {SHOWS_STATUS.includes(taskType) && (
              <div>
                <label htmlFor="task-status" className={labelClass}>Status</label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className={`${selectBase} ${borderNormal}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>
        )}

        {taskType === 'general' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-recurrence" className={labelClass}>Recurrence</label>
                <select
                  id="task-recurrence"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                  className={`${selectBase} ${borderNormal}`}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-time" className={labelClass}>Estimated Time (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  <input
                    id="task-time"
                    type="number"
                    min="0"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 30"
                    className={`${inputBase} pl-9 ${borderNormal}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-start" className={labelClass}>Start Date</label>
                <input
                  id="task-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${inputBase} ${borderNormal}`}
                />
              </div>
              <div>
                <label htmlFor="task-tags" className={labelClass}>Tags</label>
                <input
                  id="task-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated, e.g. billing, Q3"
                  className={`${inputBase} ${borderNormal}`}
                />
              </div>
            </div>

            <AttachmentsField value={attachments} onChange={setAttachments} />

            <div>
              <label htmlFor="task-comments" className={labelClass}>Comments</label>
              <textarea
                id="task-comments"
                value={initialComment}
                onChange={(e) => setInitialComment(e.target.value)}
                rows={2}
                placeholder="Add an initial comment (optional)"
                className={`${inputBase} ${borderNormal} resize-none`}
              />
            </div>
          </>
        )}

        {taskType === 'workflow' && (
          <MetaFieldGroup fields={WORKFLOW_FIELDS} values={meta} onChange={setMetaField} />
        )}

        {taskType === 'project' && (
          <MetaFieldGroup fields={PROJECT_FIELDS} values={meta} onChange={setMetaField} />
        )}

        {taskType === 'ai' && (
          <>
            <MetaFieldGroup fields={AI_FIELDS} values={meta} onChange={setMetaField} />
            {err('prompt') && (
              <p role="alert" className="text-[10px] text-red-400 -mt-2">{errors.prompt}</p>
            )}
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                Execution output
              </p>
              <MetaFieldGroup fields={AI_OUTPUT_FIELDS} values={{ executionStatus: 'idle', result: '' }} onChange={() => {}} />
            </div>
          </>
        )}

        {taskType === 'contract' && (
          <MetaFieldGroup fields={CONTRACT_FIELDS} values={meta} onChange={setMetaField} />
        )}

        </motion.div>
        </AnimatePresence>

        <div className="pt-1">
          <p className="text-[10px] text-white/25 mb-3">
            Fields marked with <span className="text-priority-high">*</span> are required
          </p>
          <button
            type="submit"
            disabled={!title.trim()}
            aria-disabled={!title.trim() ? 'true' : 'false'}
            className="bg-jade hover:bg-jade-dark text-noir-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}

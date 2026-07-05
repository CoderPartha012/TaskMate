import React, { useState } from 'react';
import { ArrowLeft, CalendarIcon, CheckCircleIcon, Clock } from 'lucide-react';
import { Priority, Category, RecurrencePattern, Status, TaskType, TaskAttachment } from '../types';
import { useTaskStore } from '../store/taskStore';
import { TaskCategoryOverview, TASK_TYPE_LABELS } from './TaskTypeSelector';
import { MetaFieldGroup } from './MetaFieldGroup';
import { AttachmentsField } from './AttachmentsField';
import {
  WORKFLOW_FIELDS,
  PROJECT_FIELDS,
  AI_FIELDS,
  AI_OUTPUT_FIELDS,
  CONTRACT_FIELDS,
} from './metaFieldConfigs';

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

  if (taskType === null) {
    return (
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6 mb-6">
        <h2 className="font-display font-bold text-base text-white mb-5 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-jade" aria-hidden="true" />
          Add New Task
        </h2>
        <TaskCategoryOverview onSelect={setTaskType} />
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
  };

  const handleChangeCategory = () => {
    resetForm();
    setTaskType(null);
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

    resetForm();
    setViewingTaskId(newTaskId);
    setActiveSection('task-detail');
  };

  const err = (key: keyof Errors) => submitted && errors[key];

  return (
    <form onSubmit={handleSubmit} className="bg-noir-700 border border-white/[0.06] rounded-xl p-6 mb-6" noValidate>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-jade" aria-hidden="true" />
          Add New Task — {TASK_TYPE_LABELS[taskType]}
        </h2>
        <button
          type="button"
          onClick={handleChangeCategory}
          className="flex items-center gap-1 text-[11px] font-semibold text-white/35 hover:text-jade transition-colors shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          Change category
        </button>
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

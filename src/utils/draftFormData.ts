import { format } from 'date-fns';
import { Priority, Category, RecurrencePattern, Status, TaskType } from '../types';
import { TaskDraft } from '../types/draft.types';
import { WORKFLOW_FIELDS, PROJECT_FIELDS, AI_FIELDS, CONTRACT_FIELDS } from '../components/common/metaFieldConfigs';

export interface DraftAttachmentMeta {
  name: string;
  type: string;
  size: number;
}

export interface DraftFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority | '';
  category: Category | '';
  status: Status;
  assignee: string;
  recurrence: RecurrencePattern;
  estimatedTime: string;
  startDate: string;
  tags: string;
  attachments: DraftAttachmentMeta[];
  initialComment: string;
  meta: Record<string, string>;
}

const GENERAL_FIELD_KEYS: (keyof DraftFormData)[] = [
  'title', 'description', 'dueDate', 'priority', 'category', 'assignee', 'startDate', 'tags', 'initialComment',
];

const META_FIELDS_BY_TYPE: Partial<Record<TaskType, { key: string }[]>> = {
  workflow: WORKFLOW_FIELDS,
  project: PROJECT_FIELDS,
  ai: AI_FIELDS,
  contract: CONTRACT_FIELDS,
};

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function metaVal(data: DraftFormData, key: string): string {
  return data.meta[key] ?? '';
}

export function hasMeaningfulData(data: DraftFormData): boolean {
  return (
    isFilled(data.title) ||
    isFilled(data.description) ||
    isFilled(data.dueDate) ||
    isFilled(data.priority) ||
    isFilled(data.category) ||
    isFilled(data.assignee) ||
    data.recurrence !== 'none' ||
    isFilled(data.estimatedTime) ||
    isFilled(data.startDate) ||
    isFilled(data.tags) ||
    data.attachments.length > 0 ||
    isFilled(data.initialComment) ||
    Object.values(data.meta).some((v) => isFilled(v))
  );
}

export function computeCompletionPercent(taskType: TaskType, data: DraftFormData): number {
  if (taskType === 'general') {
    const filled = GENERAL_FIELD_KEYS.filter((k) => isFilled(data[k])).length;
    return Math.round((filled / GENERAL_FIELD_KEYS.length) * 100);
  }

  const metaFields = META_FIELDS_BY_TYPE[taskType] ?? [];
  const totalKeys = ['title', ...metaFields.map((f) => f.key)];
  const filled = totalKeys.filter((key) => (key === 'title' ? isFilled(data.title) : isFilled(metaVal(data, key)))).length;
  return totalKeys.length === 0 ? 0 : Math.round((filled / totalKeys.length) * 100);
}

function safeFormatDate(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : format(d, 'MMM d');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getPreviewChips(taskType: TaskType, data: DraftFormData): string[] {
  const chips: string[] = [];
  const push = (label: string, value: string | null | undefined) => {
    if (chips.length >= 3) return;
    if (value) chips.push(`${label}: ${value}`);
  };

  switch (taskType) {
    case 'general':
      push('Due', safeFormatDate(data.dueDate));
      push('Priority', data.priority ? capitalize(data.priority) : null);
      push('Assignee', data.assignee.trim() || null);
      break;
    case 'workflow':
      push('Stage', metaVal(data, 'currentStage'));
      push('Reviewer', metaVal(data, 'reviewer'));
      push('SLA', metaVal(data, 'slaHours') ? `${metaVal(data, 'slaHours')}h` : null);
      break;
    case 'project':
      push('Epic', metaVal(data, 'epic'));
      push('Sprint', metaVal(data, 'sprint'));
      push('Points', metaVal(data, 'storyPoints'));
      break;
    case 'ai':
      push('Model', metaVal(data, 'model'));
      push('Trigger', metaVal(data, 'trigger'));
      push('Output', metaVal(data, 'outputType'));
      break;
    case 'contract':
      push('Type', metaVal(data, 'contractType'));
      push('Counterparty', metaVal(data, 'counterparty'));
      push('Expiry', safeFormatDate(metaVal(data, 'expiryDate')));
      break;
  }
  return chips;
}

export function convertDraftCategory(draft: TaskDraft, newCategory: TaskType): TaskDraft {
  const oldData = draft.formData as DraftFormData;
  const newData: DraftFormData = {
    title: oldData.title,
    description: oldData.description,
    dueDate: oldData.dueDate,
    priority: oldData.priority,
    status: oldData.status,
    assignee: oldData.assignee,
    category: '',
    recurrence: 'none',
    estimatedTime: '',
    startDate: '',
    tags: '',
    attachments: [],
    initialComment: '',
    meta: {},
  };

  return {
    ...draft,
    category: newCategory,
    formData: newData,
    lastModified: new Date().toISOString(),
    completionPercent: computeCompletionPercent(newCategory, newData),
  };
}

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';
export type Category = 'work' | 'personal' | 'urgent' | 'other';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';
export type AppSection = 'add-task' | 'repository' | 'analytics' | 'reports' | 'calendar' | 'ai-execution' | 'task-detail' | 'settings';

export type TaskType = 'general' | 'workflow' | 'project' | 'ai' | 'contract';

export interface AttachmentVersion {
  dataUrl: string;
  size: number; // bytes
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  versions?: AttachmentVersion[]; // prior versions, newest first — current file is represented by this attachment's own top-level fields
  obligationId?: string; // set when uploaded from inside an Obligation drawer
}

export type ActivityType =
  | 'created'
  | 'assigned'
  | 'status_changed'
  | 'metadata_updated'
  | 'attachment_added'
  | 'comment_added'
  | 'due_date_changed'
  | 'ai_execution_started'
  | 'ai_execution_completed'
  | 'workflow_stage_changed'
  | 'contract_signed';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  user: string;
  timestamp: string;
}

export interface GeneralMeta {
  tags: string[];
}

export interface WorkflowMeta {
  currentStage: string;
  nextStage: string;
  reviewer: string;
  approver: string;
  approvalLevel: string;
  triggerCondition: string;
  slaHours?: number;
  escalationRule: string;
}

export interface ProjectMeta {
  epic: string;
  sprint: string;
  milestone: string;
  team: string;
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  progressPercent: number;
}

export type AIExecutionStatus = 'idle' | 'running' | 'success' | 'failed';

export interface AIExecutionRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: AIExecutionStatus;
  prompt: string;
  result: string;
  logs: string[];
  durationMs?: number;
  retryCount: number;
  tokenUsage?: number;
  model: string;
  temperature?: number;
}

export interface AIMeta {
  model: string;
  prompt: string;
  inputSource: string;
  outputType: string;
  trigger: string;
  automationRule: string;
  confidenceThreshold?: number;
  retryPolicy: string;
  schedule: string;
  executionStatus: AIExecutionStatus;
  result: string;
  logs: string[];
  startedAt?: string;
  completedAt?: string;
  temperature?: number;
  executionHistory?: AIExecutionRun[];
}

export interface ContractMeta {
  contractId: string;
  contractType: string;
  template: string;
  requestor: string;
  businessUnit: string;
  counterparty: string;
  reviewer: string;
  approver: string;
  signatory: string;
  effectiveDate: string;
  expiryDate: string;
  renewalDate: string;
  complianceStatus: string;
  workflowStage: string;
  documentVersion: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  mentions: string[]; // Array of user IDs
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: Category;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type ObligationStatus = 'upcoming' | 'due-soon' | 'overdue' | 'completed';

export interface ObligationComment {
  id: string;
  user: string;
  content: string;
  createdAt: string;
}

export interface ObligationHistoryEntry {
  id: string;
  message: string;
  user: string;
  timestamp: string;
}

export interface Obligation {
  id: string;
  title: string;
  description: string;
  notes: string;
  owner: string;
  dueDate: string;
  reminderDate?: string;
  status: ObligationStatus;
  priority: Priority;
  progress: number; // 0-100
  comments: ObligationComment[];
  history: ObligationHistoryEntry[];
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate?: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  category: Category;
  recurrence: RecurrencePattern;
  lastModified: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks: Subtask[];
  dependencies: string[]; // array of task IDs
  archived: boolean;
  completedAt?: string;
  assignees: string[]; // array of user IDs
  comments: Comment[];
  sharedLink?: string;
  taskType: TaskType;
  attachments?: TaskAttachment[];
  generalMeta?: GeneralMeta;
  workflowMeta?: WorkflowMeta;
  projectMeta?: ProjectMeta;
  aiMeta?: AIMeta;
  contractMeta?: ContractMeta;
  activityLog: ActivityEntry[];
  createdBy: string;
  watchers: string[];
  activeTimerStartedAt?: string;
  obligations?: Obligation[];
}

export interface TaskFilter {
  status: Status | 'all';
  priority: Priority | 'all';
  category: Category | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'estimatedTime';
  showArchived: boolean;
}

export interface ThemeConfig {
  accentColor: string;
}

export interface Analytics {
  completedTasks: number;
  pendingTasks: number;
  totalTimeSpent: number;
  productivityScore: number;
  tasksByCategory: Record<Category, number>;
  tasksByPriority: Record<Priority, number>;
  dailyCompletions: Array<{
    date: string;
    count: number;
  }>;
}
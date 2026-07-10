export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';
export type Category = 'work' | 'personal' | 'urgent' | 'other';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';
export type AppSection = 'add-task' | 'repository' | 'analytics' | 'reports' | 'task-detail' | 'settings';

export type TaskType = 'general' | 'workflow' | 'project' | 'ai' | 'contract';

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
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
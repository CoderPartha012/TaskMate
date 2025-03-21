export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';
export type Category = 'work' | 'personal' | 'urgent' | 'other';
export type ViewMode = 'list' | 'grid' | 'kanban' | 'analytics';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';

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
  dueDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  category: Category;
  recurrence: RecurrencePattern;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks: Subtask[];
  dependencies: string[]; // array of task IDs
  archived: boolean;
  completedAt?: string;
  assignees: string[]; // array of user IDs
  comments: Comment[];
  sharedLink?: string;
}

export interface TaskFilter {
  status: Status | 'all';
  priority: Priority | 'all';
  category: Category | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'estimatedTime';
  viewMode: ViewMode;
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
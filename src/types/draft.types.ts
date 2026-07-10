import { TaskType } from '../types';

export interface TaskDraft {
  id: string;
  category: TaskType;
  formData: Record<string, unknown>;
  createdAt: string;
  lastModified: string;
  completionPercent: number;
}

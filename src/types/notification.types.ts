export type NotificationType = 'due_today' | 'overdue' | 'upcoming' | 'completed' | 'status_changed' | 'task_added';

export interface TaskNotification {
  id: string;
  type: NotificationType;
  taskId: string;
  taskTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
}

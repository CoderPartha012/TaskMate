export type NotificationType =
  | 'due_today'
  | 'overdue'
  | 'upcoming'
  | 'completed'
  | 'status_changed'
  | 'task_added'
  | 'sla_due_soon'
  | 'sla_breached'
  | 'contract_expiring'
  | 'contract_expired';

export interface TaskNotification {
  id: string;
  type: NotificationType;
  taskId: string;
  taskTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
}

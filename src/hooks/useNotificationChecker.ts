import { useEffect } from 'react';
import { isToday, isPast, differenceInCalendarDays } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';
import { getWorkflowSLAStatus, getContractAlert } from '../utils/taskAlerts';

export function useNotificationChecker() {
  const tasks = useTaskStore((s) => s.tasks);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const check = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tasks.forEach((task) => {
        if (task.status === 'completed' || task.archived) return;

        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);

        if (isPast(due) && !isToday(due)) {
          addNotification({
            type: 'overdue',
            taskId: task.id,
            taskTitle: task.title,
            message: `"${task.title}" is overdue`,
          });
        } else if (isToday(due)) {
          addNotification({
            type: 'due_today',
            taskId: task.id,
            taskTitle: task.title,
            message: `"${task.title}" is due today`,
          });
        } else {
          const daysUntil = differenceInCalendarDays(due, today);
          if (daysUntil <= 2) {
            addNotification({
              type: 'upcoming',
              taskId: task.id,
              taskTitle: task.title,
              message: `"${task.title}" is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
            });
          }
        }

        const slaStatus = getWorkflowSLAStatus(task);
        if (slaStatus === 'breached') {
          addNotification({
            type: 'sla_breached',
            taskId: task.id,
            taskTitle: task.title,
            message: `SLA breached for "${task.title}"`,
          });
        } else if (slaStatus === 'due-soon') {
          addNotification({
            type: 'sla_due_soon',
            taskId: task.id,
            taskTitle: task.title,
            message: `SLA due soon for "${task.title}"`,
          });
        }

        const contractAlert = getContractAlert(task);
        if (contractAlert === 'expired') {
          addNotification({
            type: 'contract_expired',
            taskId: task.id,
            taskTitle: task.title,
            message: `Contract "${task.title}" has expired`,
          });
        } else if (contractAlert === 'expiring-soon') {
          addNotification({
            type: 'contract_expiring',
            taskId: task.id,
            taskTitle: task.title,
            message: `Contract "${task.title}" is expiring soon`,
          });
        }
      });
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, addNotification]);
}

import { useEffect } from 'react';
import { isToday, isPast, differenceInCalendarDays } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { useNotificationStore } from '../store/notificationStore';

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
      });
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, addNotification]);
}

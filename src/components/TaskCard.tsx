import React from 'react';
import { Task } from '../types';
import { Calendar, Clock, AlertCircle, Archive, Undo2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTaskStore } from '../store/taskStore';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, archiveTask, restoreTask } = useTaskStore();

  const priorityColors = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  };

  const statusColors = {
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    completed: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
  };

  const categoryColors = {
    work: 'border-l-blue-500',
    personal: 'border-l-purple-500',
    urgent: 'border-l-red-500',
    other: 'border-l-gray-500'
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtaskProgress = task.subtasks.length > 0
    ? (completedSubtasks / task.subtasks.length) * 100
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border-l-4 ${categoryColors[task.category]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>

      {task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Subtasks Progress: {completedSubtasks}/{task.subtasks.length}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 dark:bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${subtaskProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1" title="Due Date">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
        </div>
        {task.estimatedTime && (
          <div className="flex items-center gap-1" title="Estimated Time">
            <Clock className="w-4 h-4" />
            <span>{task.estimatedTime} min</span>
          </div>
        )}
        {task.recurrence !== 'none' && (
          <div className="flex items-center gap-1" title="Recurring Task">
            <AlertCircle className="w-4 h-4" />
            <span>{task.recurrence}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value as Task['status'] })}
          className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <div className="flex gap-2">
          {task.archived ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => restoreTask(task.id)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              title="Restore task"
            >
              <Undo2 className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => archiveTask(task.id)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
              title="Archive task"
            >
              <Archive className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
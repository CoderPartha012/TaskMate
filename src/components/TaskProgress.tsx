import React from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';

export function TaskProgress() {
  const tasks = useTaskStore((state) => state.tasks.filter((t) => !t.archived));
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Task Progress
      </h2>
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-blue-600 dark:bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {completedTasks} of {totalTasks} tasks completed ({Math.round(progress)}%)
      </div>
    </div>
  );
}
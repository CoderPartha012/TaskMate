import React from 'react';
import { Task } from '../types';
import { Calendar, Clock, AlertCircle, Archive, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTaskStore } from '../store/taskStore';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, archiveTask, restoreTask } = useTaskStore();

  const priorityStyles: Record<string, string> = {
    high:   'bg-red-500/15   text-red-400   border border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    low:    'bg-jade/15      text-jade      border border-jade/20',
  };

  const categoryStyles: Record<string, string> = {
    work:     'bg-blue-500/10   text-blue-400',
    personal: 'bg-purple-500/10 text-purple-400',
    urgent:   'bg-red-500/10    text-red-400',
    other:    'bg-white/5       text-white/40',
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
      className="relative overflow-hidden rounded-xl p-5 bg-noir-700 border border-white/[0.06] hover:bg-noir-600 hover:border-white/[0.11] transition-all duration-200 cursor-pointer"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl
        ${task.priority === 'high'   ? 'bg-priority-high'   :
          task.priority === 'medium' ? 'bg-priority-medium'  :
                                       'bg-priority-low'}`}
      />

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-display font-bold text-sm text-white leading-snug">{task.title}</h3>
        <div className="flex gap-2 ml-3 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryStyles[task.category]}`}>
            {task.category}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-white/45 mt-1.5 leading-relaxed">{task.description}</p>

      {task.subtasks.length > 0 && (
        <div className="mt-3 mb-3">
          <div className="text-[11px] text-white/35 mb-1.5">
            Subtasks: {completedSubtasks}/{task.subtasks.length}
          </div>
          <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-jade rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${subtaskProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-[11px] text-white/35 mt-3 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
        </div>
        {task.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.estimatedTime} min</span>
          </div>
        )}
        {task.recurrence !== 'none' && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{task.recurrence}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value as Task['status'] })}
          className="rounded-lg border border-white/10 bg-noir-600 text-white/60 text-xs px-2 py-1 focus:outline-none focus:border-jade"
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
              className="text-jade hover:text-jade-light transition-colors"
              title="Restore task"
            >
              <Undo2 className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => archiveTask(task.id)}
              className="text-white/30 hover:text-white/60 transition-colors"
              title="Archive task"
            >
              <Archive className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

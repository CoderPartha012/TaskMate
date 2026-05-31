import React from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';

export function TaskProgress() {
  const tasks = useTaskStore((state) => state.tasks.filter((t) => !t.archived));
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress  = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl px-5 py-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
          Overall Progress
        </p>
        <span className="font-display font-bold text-sm text-jade">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-jade rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-white/30 mt-1.5">
        {completed} of {total} tasks completed
      </p>
    </div>
  );
}

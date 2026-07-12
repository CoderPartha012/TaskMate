import React from 'react';
import { motion } from 'framer-motion';
import { Info, ListTodo, MessageSquare, Link2, FileText, History, ClipboardList } from 'lucide-react';

export type TaskDetailTabKey = 'details' | 'subtasks' | 'comments' | 'related' | 'documents' | 'logs' | 'obligations';

const TABS: { key: TaskDetailTabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'details', label: 'Details', icon: Info },
  { key: 'subtasks', label: 'Subtasks', icon: ListTodo },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
  { key: 'related', label: 'Related Tasks', icon: Link2 },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'logs', label: 'Logs', icon: History },
  { key: 'obligations', label: 'Obligations', icon: ClipboardList },
];

interface TaskDetailTabsProps {
  active: TaskDetailTabKey;
  onSelect: (key: TaskDetailTabKey) => void;
}

export function TaskDetailTabs({ active, onSelect }: TaskDetailTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto mb-6">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors ${
              isActive ? 'text-jade' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
            {isActive && (
              <motion.div
                layoutId="taskDetailTabIndicator"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-jade rounded-full shadow-[0_0_8px_rgba(0,200,150,0.6)]"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

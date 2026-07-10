import React from 'react';
import { ListChecks, Workflow, KanbanSquare, Sparkles, FileSignature } from 'lucide-react';
import { TaskType } from '../types';
import { TASK_TYPE_SHORT } from './TaskTypeSelector';

const TAB_ICON: Record<TaskType, React.ReactNode> = {
  general: <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />,
  workflow: <Workflow className="w-3.5 h-3.5" aria-hidden="true" />,
  project: <KanbanSquare className="w-3.5 h-3.5" aria-hidden="true" />,
  ai: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />,
  contract: <FileSignature className="w-3.5 h-3.5" aria-hidden="true" />,
};

const TAB_ORDER: TaskType[] = ['general', 'workflow', 'project', 'ai', 'contract'];

interface TaskCategoryTabsProps {
  active: TaskType;
  onSelect: (type: TaskType) => void;
}

export function TaskCategoryTabs({ active, onSelect }: TaskCategoryTabsProps) {
  return (
    <div role="tablist" aria-label="Task category" className="flex flex-wrap gap-1.5 mb-5">
      {TAB_ORDER.map((type) => {
        const isActive = type === active;
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              isActive
                ? 'bg-jade/15 text-jade border border-jade/40'
                : 'bg-noir-600 text-white/45 border border-white/[0.07] hover:text-white/70 hover:border-white/20'
            }`}
          >
            {TAB_ICON[type]}
            {TASK_TYPE_SHORT[type]}
          </button>
        );
      })}
    </div>
  );
}

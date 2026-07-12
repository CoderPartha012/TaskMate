import React from 'react';
import { ListChecks, Workflow, KanbanSquare, Sparkles, FileSignature } from 'lucide-react';
import { TaskType } from '../../types';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  general: 'General Task Type',
  workflow: 'Workflow-Based Tasks',
  project: 'Project Management Tasks',
  ai: 'AI & Smart Task',
  contract: 'Contract / Business Workflow Tasks',
};

export const TASK_TYPE_SHORT: Record<TaskType, string> = {
  general: 'General',
  workflow: 'Workflow',
  project: 'Project',
  ai: 'AI',
  contract: 'Contract',
};

const TASK_TYPES: { type: TaskType; icon: React.ReactNode; overview: string }[] = [
  {
    type: 'general',
    icon: <ListChecks className="w-6 h-6" />,
    overview: 'Everyday to-dos with priority, due dates, tags, and file attachments.',
  },
  {
    type: 'workflow',
    icon: <Workflow className="w-6 h-6" />,
    overview: 'Stage-based approvals with reviewers, approvers, and SLA-driven escalation.',
  },
  {
    type: 'project',
    icon: <KanbanSquare className="w-6 h-6" />,
    overview: 'Sprints, epics, milestones, story points, and hour tracking.',
  },
  {
    type: 'ai',
    icon: <Sparkles className="w-6 h-6" />,
    overview: 'Prompt-driven automation jobs you can configure, execute, and monitor.',
  },
  {
    type: 'contract',
    icon: <FileSignature className="w-6 h-6" />,
    overview: 'Contract drafting, review, approval, and expiry tracking.',
  },
];

interface TaskCategoryCardProps {
  type: TaskType;
  icon: React.ReactNode;
  overview: string;
  onSelect: (type: TaskType) => void;
}

function TaskCategoryCard({ type, icon, overview, onSelect }: TaskCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="w-full flex items-start gap-3 p-5 rounded-xl border-2 border-white/[0.07] bg-noir-600 hover:border-jade/40 hover:bg-jade/[0.05] text-left transition-all"
    >
      <span className="text-white/40 shrink-0">{icon}</span>
      <div>
        <p className="font-display font-bold text-sm text-white/85">{TASK_TYPE_LABELS[type]}</p>
        <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{overview}</p>
      </div>
    </button>
  );
}

interface TaskCategoryOverviewProps {
  onSelect: (type: TaskType) => void;
}

export function TaskCategoryOverview({ onSelect }: TaskCategoryOverviewProps) {
  const [general, workflow, project, ai, contract] = TASK_TYPES;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
        Choose a task category to get started
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TaskCategoryCard {...general} onSelect={onSelect} />
        <TaskCategoryCard {...workflow} onSelect={onSelect} />
        <TaskCategoryCard {...project} onSelect={onSelect} />
        <TaskCategoryCard {...ai} onSelect={onSelect} />
        <div className="sm:col-span-2 flex justify-center">
          <div className="w-full sm:w-[calc(50%-0.5rem)]">
            <TaskCategoryCard {...contract} onSelect={onSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}

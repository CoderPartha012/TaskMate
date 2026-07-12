import React from 'react';
import { Task } from '../../types';
import { TaskGeneralInfo } from './TaskGeneralInfo';
import { TaskDescriptionSection } from './TaskDescriptionSection';
import { TaskCategoryMetaSection } from './TaskCategoryMetaSection';
import { TaskQuickSummarySidebar } from './TaskQuickSummarySidebar';
import { TaskTimeTracker } from './TaskTimeTracker';
import { GeneralDraft } from './taskDetailTypes';

interface TaskDetailsTabProps {
  task: Task;
  editing: boolean;
  generalDraft: GeneralDraft;
  descriptionDraft: string;
  metaDraft: Record<string, string>;
  onGeneralChange: (patch: Partial<GeneralDraft>) => void;
  onDescriptionChange: (value: string) => void;
  onMetaChange: (key: string, value: string) => void;
}

export function TaskDetailsTab({
  task, editing, generalDraft, descriptionDraft, metaDraft,
  onGeneralChange, onDescriptionChange, onMetaChange,
}: TaskDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-6 min-w-0">
        <TaskGeneralInfo task={task} editing={editing} draft={generalDraft} onChange={onGeneralChange} />
        <TaskDescriptionSection task={task} editing={editing} value={descriptionDraft} onChange={onDescriptionChange} />
        <TaskTimeTracker task={task} />
        <TaskCategoryMetaSection task={task} editing={editing} metaDraft={metaDraft} onMetaChange={onMetaChange} />
      </div>

      <div className="space-y-6">
        <TaskQuickSummarySidebar task={task} />
      </div>
    </div>
  );
}

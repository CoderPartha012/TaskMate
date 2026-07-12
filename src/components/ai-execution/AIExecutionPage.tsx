import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, History, BookMarked, Terminal } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { AIExecutionOverviewTab } from './AIExecutionOverviewTab';
import { AIExecutionHistoryTab } from './AIExecutionHistoryTab';
import { AIPromptLibraryTab } from './AIPromptLibraryTab';
import { AIPlaygroundTab } from './AIPlaygroundTab';

type AIExecutionTabKey = 'overview' | 'history' | 'prompts' | 'playground';

const TABS: { key: AIExecutionTabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'history', label: 'Execution History', icon: History },
  { key: 'prompts', label: 'Prompt Library', icon: BookMarked },
  { key: 'playground', label: 'Playground', icon: Terminal },
];

export function AIExecutionPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const setViewingTaskId = useTaskStore((s) => s.setViewingTaskId);
  const setActiveSection = useTaskStore((s) => s.setActiveSection);
  const setPendingTaskDetailTab = useTaskStore((s) => s.setPendingTaskDetailTab);

  const [activeTab, setActiveTab] = useState<AIExecutionTabKey>('overview');
  const [playgroundPrompt, setPlaygroundPrompt] = useState<string | undefined>(undefined);

  const handleOpenTask = (taskId: string) => {
    setPendingTaskDetailTab('details');
    setViewingTaskId(taskId);
    setActiveSection('task-detail');
  };

  const handleUsePrompt = (prompt: string) => {
    setPlaygroundPrompt(prompt);
    setActiveTab('playground');
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto mb-6">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors ${
                isActive ? 'text-jade' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
              {isActive && (
                <motion.div
                  layoutId="aiExecutionTabIndicator"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-jade rounded-full"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && <AIExecutionOverviewTab tasks={tasks} onOpenTask={handleOpenTask} />}
      {activeTab === 'history' && <AIExecutionHistoryTab tasks={tasks} onOpenTask={handleOpenTask} />}
      {activeTab === 'prompts' && <AIPromptLibraryTab onUsePrompt={handleUsePrompt} />}
      {activeTab === 'playground' && <AIPlaygroundTab initialPrompt={playgroundPrompt} />}
    </div>
  );
}

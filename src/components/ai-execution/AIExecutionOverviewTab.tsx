import React, { useMemo } from 'react';
import { isToday } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { AIExecutionStatus, Task } from '../../types';
import { getAITasks, flattenExecutionRuns, formatDuration } from '../../utils/aiExecutionRuns';

const QUEUE_COLUMNS: { status: AIExecutionStatus; label: string; color: string }[] = [
  { status: 'idle', label: 'Queued', color: 'text-white/40' },
  { status: 'running', label: 'Running', color: 'text-blue-400' },
  { status: 'success', label: 'Completed', color: 'text-jade' },
  { status: 'failed', label: 'Failed', color: 'text-red-400' },
];

interface AIExecutionOverviewTabProps {
  tasks: Task[];
  onOpenTask: (taskId: string) => void;
}

export function AIExecutionOverviewTab({ tasks, onOpenTask }: AIExecutionOverviewTabProps) {
  const aiTasks = useMemo(() => getAITasks(tasks), [tasks]);
  const runs = useMemo(() => flattenExecutionRuns(tasks), [tasks]);

  const todayCount = runs.filter((r) => isToday(new Date(r.startedAt))).length;
  const completedRuns = runs.filter((r) => r.status === 'success' || r.status === 'failed');
  const successRate = completedRuns.length > 0
    ? Math.round((completedRuns.filter((r) => r.status === 'success').length / completedRuns.length) * 100)
    : 0;
  const avgDurationMs = completedRuns.length > 0
    ? completedRuns.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / completedRuns.length
    : undefined;
  const failedCount = runs.filter((r) => r.status === 'failed').length;
  const queueLength = aiTasks.filter((t) => t.aiMeta?.executionStatus === 'running').length;
  const tokensUsed = runs.reduce((sum, r) => sum + (r.tokenUsage ?? 0), 0);

  const metrics: { label: string; value: string; colorClass: string }[] = [
    { label: "Today's Executions", value: String(todayCount), colorClass: 'text-white' },
    { label: 'Success Rate', value: `${successRate}%`, colorClass: 'text-jade' },
    { label: 'Average Duration', value: formatDuration(avgDurationMs), colorClass: 'text-blue-400' },
    { label: 'Failed Runs', value: String(failedCount), colorClass: 'text-red-500' },
    { label: 'Queue Length', value: String(queueLength), colorClass: 'text-amber-400' },
    { label: 'Tokens Used', value: tokensUsed.toLocaleString(), colorClass: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-start gap-1 px-3.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{m.label}</span>
            <span className={`text-xl font-bold font-display leading-none ${m.colorClass}`}>{m.value}</span>
          </div>
        ))}
      </div>

      {aiTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-white/25" aria-hidden="true" />
          </span>
          <p className="text-xs text-white/40">No AI tasks yet — create one from Add New Task to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUEUE_COLUMNS.map(({ status, label, color }) => {
            const columnTasks = aiTasks.filter((t) => (t.aiMeta?.executionStatus ?? 'idle') === status);
            return (
              <div key={status}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 ${color}`}>
                  {label} <span className="text-white/30">({columnTasks.length})</span>
                </p>
                <div className="space-y-2">
                  {columnTasks.length === 0 ? (
                    <p className="text-[11px] text-white/20">Empty</p>
                  ) : (
                    columnTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onOpenTask(task.id)}
                        className="w-full text-left bg-noir-700 border border-white/[0.06] rounded-lg px-3 py-2.5 hover:border-white/[0.15] transition-colors"
                      >
                        <p className="text-xs font-semibold text-white/80 truncate">{task.title}</p>
                        <p className="text-[10px] text-white/35 mt-0.5 truncate">{task.aiMeta?.model || 'No model set'}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

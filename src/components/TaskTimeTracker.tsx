import React, { useEffect, useState } from 'react';
import { Play, Square, Timer as TimerIcon } from 'lucide-react';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';

interface TaskTimeTrackerProps {
  task: Task;
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TaskTimeTracker({ task }: TaskTimeTrackerProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [, setTick] = useState(0);

  const running = !!task.activeTimerStartedAt;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handleStart = () => {
    updateTask(task.id, { activeTimerStartedAt: new Date().toISOString() });
  };

  const handleStop = () => {
    if (!task.activeTimerStartedAt) return;
    const startedAt = new Date(task.activeTimerStartedAt).getTime();
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

    const updates: Partial<Task> = {
      activeTimerStartedAt: undefined,
      actualTime: (task.actualTime ?? 0) + elapsedMinutes,
    };
    if (task.taskType === 'project' && task.projectMeta) {
      updates.projectMeta = {
        ...task.projectMeta,
        actualHours: Math.round(((task.projectMeta.actualHours ?? 0) + elapsedMinutes / 60) * 10) / 10,
      };
    }

    updateTask(
      task.id,
      updates,
      [{ type: 'metadata_updated', message: `Worked for ${formatMinutes(elapsedMinutes)}`, user: 'You' }]
    );
  };

  const elapsedMs = running ? Date.now() - new Date(task.activeTimerStartedAt as string).getTime() : 0;

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${running ? 'bg-jade/15 text-jade' : 'bg-white/[0.05] text-white/40'}`}>
          <TimerIcon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display font-bold text-sm text-white">Time Tracker</p>
          <p className="text-[11px] text-white/40">
            {running ? <span className="text-jade font-mono">{formatElapsed(elapsedMs)} elapsed</span> : 'Not currently tracking'}
          </p>
        </div>
      </div>

      {running ? (
        <button
          type="button"
          onClick={handleStop}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStart}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Start
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { AIExecutionStatus } from '../../types';
import { FlatRun, formatDuration } from '../../utils/aiExecutionRuns';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';

const STATUS_TEXT_COLOR: Record<AIExecutionStatus, string> = {
  idle: 'text-white/40',
  running: 'text-blue-400',
  success: 'text-jade',
  failed: 'text-red-400',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="text-xs text-white/75 mt-0.5">{value}</p>
    </div>
  );
}

interface AIExecutionRunDetailModalProps {
  run: FlatRun;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
}

export function AIExecutionRunDetailModal({ run, onClose, onOpenTask }: AIExecutionRunDetailModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-noir-800 border border-white/[0.08] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-white">Run Details</h3>
              <button
                type="button"
                onClick={() => onOpenTask(run.taskId)}
                className="text-[11px] text-jade hover:text-jade-light transition-colors truncate block"
              >
                {run.taskTitle}
              </button>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" value={<span className={`font-bold capitalize ${STATUS_TEXT_COLOR[run.status]}`}>{run.status}</span>} />
              <Field label="Model" value={run.model || '—'} />
              <Field label="Duration" value={formatDuration(run.durationMs)} />
              <Field label="Retry Count" value={String(run.retryCount)} />
              <Field label="Token Usage" value={run.tokenUsage != null ? run.tokenUsage.toLocaleString() : '—'} />
              <Field label="Temperature" value={run.temperature != null ? String(run.temperature) : '—'} />
              <Field label="Started" value={format(new Date(run.startedAt), 'MMM d, h:mm:ss a')} />
              <Field label="Completed" value={run.completedAt ? format(new Date(run.completedAt), 'MMM d, h:mm:ss a') : '—'} />
            </div>

            <div>
              <p className={labelClass}>Prompt</p>
              <p className="text-xs text-white/70 bg-noir-600 border border-white/[0.06] rounded-lg p-3 mt-1 whitespace-pre-wrap break-words">{run.prompt || '—'}</p>
            </div>

            <div>
              <p className={labelClass}>Output</p>
              <p className="text-xs text-white/70 bg-noir-600 border border-white/[0.06] rounded-lg p-3 mt-1 whitespace-pre-wrap break-words">{run.result || '—'}</p>
            </div>

            <div>
              <p className={labelClass}>Execution Logs</p>
              <div className="mt-1 bg-black/60 border border-white/[0.08] rounded-lg p-3 font-mono text-[11px] text-jade/90 space-y-1 max-h-48 overflow-y-auto">
                {run.logs.length === 0 ? (
                  <p className="text-white/25">No logs.</p>
                ) : (
                  run.logs.map((line, i) => <p key={`${run.id}-log-${i}`}>{line}</p>)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

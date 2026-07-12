import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { FlatRun, formatDuration } from '../../utils/aiExecutionRuns';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/30';

interface AIExecutionCompareModalProps {
  runA: FlatRun;
  runB: FlatRun;
  onClose: () => void;
}

function RunColumn({ run, title }: { run: FlatRun; title: string }) {
  return (
    <div className="min-w-0 flex-1 space-y-3">
      <p className="text-xs font-bold text-white/85 truncate">{title}</p>
      <div>
        <p className={labelClass}>Status</p>
        <p className="text-xs text-white/70 capitalize">{run.status}</p>
      </div>
      <div>
        <p className={labelClass}>Started</p>
        <p className="text-xs text-white/70">{format(new Date(run.startedAt), 'MMM d, h:mm a')}</p>
      </div>
      <div>
        <p className={labelClass}>Duration</p>
        <p className="text-xs text-white/70">{formatDuration(run.durationMs)}</p>
      </div>
      <div>
        <p className={labelClass}>Token Usage</p>
        <p className="text-xs text-white/70">{run.tokenUsage != null ? run.tokenUsage.toLocaleString() : '—'}</p>
      </div>
      <div>
        <p className={labelClass}>Output</p>
        <p className="text-xs text-white/70 bg-noir-600 border border-white/[0.06] rounded-lg p-2.5 mt-1 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{run.result || '—'}</p>
      </div>
    </div>
  );
}

export function AIExecutionCompareModal({ runA, runB, onClose }: AIExecutionCompareModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-noir-800 border border-white/[0.08] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
            <h3 className="font-display font-bold text-sm text-white">Compare Executions</h3>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-6">
            <RunColumn run={runA} title="Version A" />
            <div className="hidden sm:block w-px bg-white/[0.06] shrink-0" />
            <RunColumn run={runB} title="Version B" />
          </div>
        </div>
      </div>
    </>
  );
}

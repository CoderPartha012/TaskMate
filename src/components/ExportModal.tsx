import React, { useState } from 'react';
import { Download, FileText, Table2, AlertCircle, X } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { Task } from '../types';

type Format = 'csv' | 'excel';
type Scope = 'all' | 'current';

interface ExportModalProps {
  onClose: () => void;
  filteredTasks: Task[];
}

export function ExportModal({ onClose, filteredTasks }: ExportModalProps) {
  const allTasks = useTaskStore((s) => s.tasks);
  const [format, setFormat] = useState<Format | null>(null);
  const [scope, setScope] = useState<Scope>('all');

  const taskList = scope === 'all' ? allTasks : filteredTasks;
  const isEmpty = taskList.length === 0;

  const handleDownload = async () => {
    if (!format || isEmpty) return;
    if (format === 'csv') exportToCSV(taskList);
    else await exportToExcel(taskList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-noir-700 border border-white/[0.08] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
          <div>
            <h2 className="font-display font-bold text-base text-white">Export Tasks</h2>
            <p className="text-[11px] text-white/40 mt-0.5">Download your task list as a file</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Scope toggle */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
              What to export
            </p>
            <div className="flex gap-2">
              {(['all', 'current'] as Scope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    scope === s
                      ? 'border-jade/30 bg-jade/10 text-jade'
                      : 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/65'
                  }`}
                >
                  {s === 'all'
                    ? `All Tasks (${allTasks.length})`
                    : `Current View (${filteredTasks.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Format cards */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">
              File format
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* CSV card */}
              <button
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                  format === 'csv'
                    ? 'border-jade bg-jade/[0.07]'
                    : 'border-white/[0.07] hover:border-white/[0.15] bg-noir-600'
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${format === 'csv' ? 'text-jade' : 'text-white/40'}`}
                />
                <div>
                  <p className={`text-sm font-bold ${format === 'csv' ? 'text-jade' : 'text-white/80'}`}>
                    CSV
                  </p>
                  <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">
                    Best for spreadsheets and data tools
                  </p>
                </div>
              </button>

              {/* Excel card */}
              <button
                onClick={() => setFormat('excel')}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                  format === 'excel'
                    ? 'border-jade bg-jade/[0.07]'
                    : 'border-white/[0.07] hover:border-white/[0.15] bg-noir-600'
                }`}
              >
                <Table2
                  className={`w-6 h-6 ${format === 'excel' ? 'text-jade' : 'text-white/40'}`}
                />
                <div>
                  <p className={`text-sm font-bold ${format === 'excel' ? 'text-jade' : 'text-white/80'}`}>
                    Excel
                  </p>
                  <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">
                    Best for formatted reports
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Empty warning */}
          {isEmpty && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-400">No tasks to export in this selection.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-semibold border border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={!format || isEmpty}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Download, FileText, Table2, FileDown } from 'lucide-react';
import { Task } from '../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';

interface RepositoryExportMenuProps {
  tasks: Task[];
  label?: string;
}

export function RepositoryExportMenu({ tasks, label = 'Export' }: RepositoryExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setOpen(false);
    if (format === 'csv') exportToCSV(tasks);
    else if (format === 'excel') await exportToExcel(tasks);
    else await exportToPDF(tasks);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={tasks.length === 0}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-30 overflow-hidden">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-jade" />
            Export as CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Table2 className="w-3.5 h-3.5 text-jade" />
            Export as Excel
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-jade" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

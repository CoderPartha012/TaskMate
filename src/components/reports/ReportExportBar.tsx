import React, { useEffect, useRef, useState } from 'react';
import { Download, FileText, Table2, FileDown, Printer, Mail, Save, CalendarClock, Loader2 } from 'lucide-react';
import { ReportConfig, ReportColumnKey } from '../../types/report.types';
import { ReportGroup, exportReportCSV, exportReportExcel, exportReportPDF, flattenGroups } from '../../utils/reportBuilder';

interface ReportExportBarProps {
  config: ReportConfig;
  groups: ReportGroup[];
  columns: { key: ReportColumnKey; label: string }[];
  onExported: (format: 'csv' | 'excel' | 'pdf') => void;
  onPrinted: () => void;
  onOpenEmail: () => void;
  onOpenSchedule: () => void;
  onSave: () => void;
  canExport: boolean;
  canSchedule: boolean;
}

export function ReportExportBar({
  config, groups, columns, onExported, onPrinted, onOpenEmail, onOpenSchedule, onSave, canExport, canSchedule,
}: ReportExportBarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setExportOpen(false);
    }
    if (exportOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  const handleExport = async (fmt: 'csv' | 'excel' | 'pdf') => {
    setExportOpen(false);
    setBusy(true);
    try {
      if (fmt === 'csv') exportReportCSV(config.name, groups, columns, config.groupBy);
      else if (fmt === 'excel') await exportReportExcel(config.name, groups, columns, config.groupBy);
      else await exportReportPDF(config.name, groups, columns, config.groupBy);
      onExported(fmt);
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    const rows = flattenGroups(groups, config.groupBy);
    const headers = config.groupBy ? ['Group', ...columns.map((c) => c.label)] : columns.map((c) => c.label);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${config.name}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            p { font-size: 11px; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { text-align: left; padding: 6px 10px; font-size: 12px; border-bottom: 1px solid #ddd; }
            th { text-transform: uppercase; font-size: 10px; color: #666; border-bottom: 2px solid #999; }
          </style>
        </head>
        <body>
          <h1>${config.name}</h1>
          <p>${config.category} · Generated ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((r) => `<tr>${Object.values(r).map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    onPrinted();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onSave}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        Save Report
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Print
      </button>

      <button
        type="button"
        onClick={onOpenEmail}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
      >
        <Mail className="w-3.5 h-3.5" />
        Email
      </button>

      {canSchedule && (
        <button
          type="button"
          onClick={onOpenSchedule}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          <CalendarClock className="w-3.5 h-3.5" />
          Schedule
        </button>
      )}

      {canExport && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-jade hover:bg-jade-dark text-noir-800 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-noir-700 border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
              <button type="button" onClick={() => handleExport('csv')} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                <FileText className="w-3.5 h-3.5 text-jade" /> CSV
              </button>
              <button type="button" onClick={() => handleExport('excel')} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                <Table2 className="w-3.5 h-3.5 text-jade" /> Excel
              </button>
              <button type="button" onClick={() => handleExport('pdf')} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                <FileDown className="w-3.5 h-3.5 text-jade" /> PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

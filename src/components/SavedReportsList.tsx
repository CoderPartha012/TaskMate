import React from 'react';
import { format } from 'date-fns';
import { Star, FolderOpen, Copy, Trash2 } from 'lucide-react';
import { ReportConfig } from '../types/report.types';

interface SavedReportsListProps {
  reports: ReportConfig[];
  onOpen: (config: ReportConfig) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  canDelete: boolean;
}

function ReportRow({ report, onOpen, onDelete, onDuplicate, onToggleFavorite, canDelete }: {
  report: ReportConfig;
} & Omit<SavedReportsListProps, 'reports'>) {
  return (
    <div className="flex items-center justify-between gap-3 bg-noir-600 border border-white/[0.07] rounded-lg px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/85 truncate">{report.name}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{report.category} · Saved {format(new Date(report.createdAt), 'MMM d, yyyy')}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={() => onToggleFavorite(report.id)} title="Favorite" className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${report.isFavorite ? 'text-amber-400' : 'text-white/30 hover:text-amber-400'}`}>
          <Star className="w-3.5 h-3.5" fill={report.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button type="button" onClick={() => onOpen(report)} title="Open" className="p-1.5 rounded-lg text-white/40 hover:text-jade hover:bg-white/5 transition-colors">
          <FolderOpen className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onDuplicate(report.id)} title="Duplicate" className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
        {canDelete && (
          <button type="button" onClick={() => onDelete(report.id)} title="Delete" className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function SavedReportsList({ reports, onOpen, onDelete, onDuplicate, onToggleFavorite, canDelete }: SavedReportsListProps) {
  const favorites = reports.filter((r) => r.isFavorite);
  const rest = reports.filter((r) => !r.isFavorite);

  if (reports.length === 0) {
    return (
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-8 text-center text-white/30 text-sm">
        No saved reports yet. Build a report and click "Save Report" to keep it here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.length > 0 && (
        <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
          <p className="font-display font-bold text-xs text-white/70 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
            Favorites
          </p>
          <div className="space-y-2">
            {favorites.map((r) => (
              <ReportRow key={r.id} report={r} onOpen={onOpen} onDelete={onDelete} onDuplicate={onDuplicate} onToggleFavorite={onToggleFavorite} canDelete={canDelete} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
        <p className="font-display font-bold text-xs text-white/70 uppercase tracking-wide mb-3">All Saved Reports</p>
        <div className="space-y-2">
          {rest.map((r) => (
            <ReportRow key={r.id} report={r} onOpen={onOpen} onDelete={onDelete} onDuplicate={onDuplicate} onToggleFavorite={onToggleFavorite} canDelete={canDelete} />
          ))}
          {rest.length === 0 && <p className="text-xs text-white/30">All saved reports are marked as favorites.</p>}
        </div>
      </div>
    </div>
  );
}

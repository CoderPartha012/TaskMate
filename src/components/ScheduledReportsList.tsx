import React from 'react';
import { format } from 'date-fns';
import { CalendarClock, Trash2 } from 'lucide-react';
import { ScheduledReport } from '../types/report.types';

interface ScheduledReportsListProps {
  scheduled: ScheduledReport[];
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function ScheduledReportsList({ scheduled, onToggleActive, onDelete }: ScheduledReportsListProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <p className="font-display font-bold text-sm text-white/80 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-jade" />
        Scheduled Reports
      </p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-4">Runs only while TaskMate is open in a browser tab</p>

      {scheduled.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No scheduled reports. Create one from the report builder.</div>
      ) : (
        <div className="space-y-2">
          {scheduled.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 bg-noir-600 border border-white/[0.07] rounded-lg px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/85 truncate">{s.reportName}</p>
                <p className="text-[10px] text-white/35 mt-0.5 capitalize">
                  {s.frequency} · {s.time} {s.timezone} · Next run {format(new Date(s.nextRunAt), 'MMM d, yyyy h:mm a')}
                </p>
                {s.recipients.length > 0 && (
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">To: {s.recipients.join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleActive(s.id, !s.active)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors ${
                    s.active ? 'bg-jade/15 text-jade' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {s.active ? 'Active' : 'Paused'}
                </button>
                <button type="button" onClick={() => onDelete(s.id)} title="Delete" className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

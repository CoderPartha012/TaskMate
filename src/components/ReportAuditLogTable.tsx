import React from 'react';
import { format } from 'date-fns';
import { ReportAuditEntry } from '../types/report.types';

export function ReportAuditLogTable({ auditLog }: { auditLog: ReportAuditEntry[] }) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-5">
      <p className="font-display font-bold text-sm text-white/80">Audit Log</p>
      <p className="text-[10px] text-white/35 mt-0.5 mb-4">Report-related activity trail</p>

      {auditLog.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No audit activity recorded yet.</div>
      ) : (
        <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {auditLog.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 border-b border-white/[0.05] last:border-b-0 pb-2">
              <p className="text-xs text-white/70">
                <span className="font-semibold text-white/85">{entry.user}</span> {entry.activity}
              </p>
              <span className="text-[10px] text-white/30 shrink-0 whitespace-nowrap">{format(new Date(entry.timestamp), 'MMM d, h:mm a')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

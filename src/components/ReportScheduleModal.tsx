import React, { useState } from 'react';
import { X, CalendarClock, Info } from 'lucide-react';
import { ScheduleFrequency } from '../types/report.types';

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/40';
const inputBase =
  'mt-1 block w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
];

interface ReportScheduleModalProps {
  open: boolean;
  reportName: string;
  onClose: () => void;
  onCreate: (schedule: { frequency: ScheduleFrequency; startDate: string; time: string; timezone: string; recipients: string[] }) => void;
}

export function ReportScheduleModal({ open, reportName, onClose, onCreate }: ReportScheduleModalProps) {
  const [frequency, setFrequency] = useState<ScheduleFrequency>('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [recipients, setRecipients] = useState('');

  if (!open) return null;

  const handleCreate = () => {
    const list = recipients.split(',').map((r) => r.trim()).filter(Boolean);
    onCreate({ frequency, startDate, time, timezone, recipients: list });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-noir-700 border border-white/[0.08] rounded-xl p-5 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-jade" />
              Schedule Report
            </h3>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-white/40 mb-4">{reportName}</p>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)} className={inputBase}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Time Zone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputBase}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Email Recipients</label>
              <input type="text" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="name@example.com, name2@example.com" className={inputBase} />
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-white/30 bg-white/[0.03] rounded-lg p-2.5">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              Scheduled runs execute only while TaskMate is open in a browser tab — there's no server to run this in the background.
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold bg-jade hover:bg-jade-dark text-noir-800 transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

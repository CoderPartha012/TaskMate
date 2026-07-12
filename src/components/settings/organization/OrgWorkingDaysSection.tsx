import React, { useRef } from 'react';
import { Upload, Globe2, X, CalendarPlus } from 'lucide-react';
import { OrgWorkingCalendar } from '../../../store/organizationStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

interface OrgWorkingDaysSectionProps {
  draft: OrgWorkingCalendar;
  timezone: string;
  onChange: (patch: Partial<OrgWorkingCalendar>) => void;
  onImportCSV: (text: string) => void;
  onImportPublicHolidays: () => void;
  onRemoveHoliday: (id: string) => void;
}

export function OrgWorkingDaysSection({
  draft, timezone, onChange, onImportCSV, onImportPublicHolidays, onRemoveHoliday,
}: OrgWorkingDaysSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleDay = (key: string) => {
    const isWorking = draft.workingDays.includes(key);
    onChange({
      workingDays: isWorking ? draft.workingDays.filter((d) => d !== key) : [...draft.workingDays, key],
    });
  };

  const handleCSVFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    onImportCSV(text);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Working Calendar</h3>

      <div className="mb-5">
        <label className={labelClass}>Working Days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(({ key, label }) => {
            const active = draft.workingDays.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={`w-12 py-2 rounded-lg text-xs font-bold transition-colors border ${
                  active ? 'bg-jade/15 text-jade border-jade/30' : 'text-white/40 border-white/[0.08] hover:text-white/70'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div>
          <label className={labelClass} htmlFor="wc-start">Start Time</label>
          <input id="wc-start" type="time" value={draft.startTime} onChange={(e) => onChange({ startTime: e.target.value })} className={inputBase} />
        </div>
        <div>
          <label className={labelClass} htmlFor="wc-end">End Time</label>
          <input id="wc-end" type="time" value={draft.endTime} onChange={(e) => onChange({ endTime: e.target.value })} className={inputBase} />
        </div>
        <div>
          <label className={labelClass} htmlFor="wc-lunch-start">Lunch Break — Start</label>
          <input id="wc-lunch-start" type="time" value={draft.lunchStart} onChange={(e) => onChange({ lunchStart: e.target.value })} className={inputBase} />
        </div>
        <div>
          <label className={labelClass} htmlFor="wc-lunch-end">Lunch Break — End</label>
          <input id="wc-lunch-end" type="time" value={draft.lunchEnd} onChange={(e) => onChange({ lunchEnd: e.target.value })} className={inputBase} />
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-white/35 mb-5">
        <Globe2 className="w-3.5 h-3.5" aria-hidden="true" />
        Timezone: <span className="text-white/55">{timezone}</span> — inherited from Regional Settings
      </p>

      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <label className={labelClass.replace('mb-1.5', 'mb-0')}>Holiday Calendar</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
            <button
              type="button"
              onClick={onImportPublicHolidays}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-jade/25 text-jade hover:bg-jade/10 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Import Public Holidays
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleCSVFile(e.target.files?.[0])} />

        {draft.holidays.length === 0 ? (
          <p className="text-xs text-white/25">No holidays added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {draft.holidays.map((holiday) => (
              <span key={holiday.id} className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 bg-noir-600 border border-white/[0.08] rounded-full px-2.5 py-1">
                {holiday.name} · {holiday.date}
                <button type="button" onClick={() => onRemoveHoliday(holiday.id)} aria-label={`Remove ${holiday.name}`} className="text-white/30 hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

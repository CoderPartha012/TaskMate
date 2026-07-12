import React from 'react';
import { OrgRegional } from '../../../store/organizationStore';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Germany', 'Australia', 'Singapore'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Spanish', 'French', 'German'];
const CURRENCY_OPTIONS = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AUD (A$)'];
const DATE_FORMAT_OPTIONS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const FINANCIAL_YEAR_OPTIONS = ['January', 'April', 'July', 'October'];
const TIMEZONE_OPTIONS = [
  '(GMT+05:30) Asia/Kolkata',
  '(GMT+00:00) UTC',
  '(GMT-05:00) America/New_York',
  '(GMT-08:00) America/Los_Angeles',
  '(GMT+01:00) Europe/Berlin',
  '(GMT+08:00) Asia/Singapore',
];

interface OrgRegionalSectionProps {
  draft: OrgRegional;
  onChange: (patch: Partial<OrgRegional>) => void;
}

export function OrgRegionalSection({ draft, onChange }: OrgRegionalSectionProps) {
  const textField = (label: string, key: 'state' | 'city') => (
    <div key={key}>
      <label className={labelClass} htmlFor={`org-regional-${key}`}>{label}</label>
      <input
        id={`org-regional-${key}`}
        type="text"
        value={draft[key]}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<OrgRegional>)}
        className={inputBase}
      />
    </div>
  );

  const selectField = <K extends keyof OrgRegional>(label: string, key: K, options: string[]) => (
    <div key={key}>
      <label className={labelClass} htmlFor={`org-regional-${key}`}>{label}</label>
      <select
        id={`org-regional-${key}`}
        value={draft[key] as string}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<OrgRegional>)}
        className={inputBase}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Regional Settings</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectField('Country', 'country', COUNTRY_OPTIONS)}
        {textField('State', 'state')}
        {textField('City', 'city')}
        {selectField('Timezone', 'timezone', TIMEZONE_OPTIONS)}
        {selectField('Language', 'language', LANGUAGE_OPTIONS)}
        {selectField('Currency', 'currency', CURRENCY_OPTIONS)}
        {selectField('Date Format', 'dateFormat', DATE_FORMAT_OPTIONS)}

        <div>
          <label className={labelClass} htmlFor="org-regional-timeFormat">Time Format</label>
          <select
            id="org-regional-timeFormat"
            value={draft.timeFormat}
            onChange={(e) => onChange({ timeFormat: e.target.value as OrgRegional['timeFormat'] })}
            className={inputBase}
          >
            <option value="12h">12 Hour</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="org-regional-weekStartsOn">Week Starts On</label>
          <select
            id="org-regional-weekStartsOn"
            value={draft.weekStartsOn}
            onChange={(e) => onChange({ weekStartsOn: e.target.value as OrgRegional['weekStartsOn'] })}
            className={inputBase}
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>

        {selectField('Financial Year Starts', 'financialYearStart', FINANCIAL_YEAR_OPTIONS)}
      </div>
    </div>
  );
}

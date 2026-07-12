import React from 'react';
import { UserPreferences } from '../../../store/userProfileStore';
import { ToggleSwitch } from '../../common/ToggleSwitch';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const DATE_FORMAT_OPTIONS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const LANDING_PAGE_OPTIONS = ['Repository', 'Analytics', 'Calendar', 'AI Execution', 'Reports'];

interface ProfilePreferencesSectionProps {
  draft: UserPreferences;
  onChange: (patch: Partial<UserPreferences>) => void;
}

export function ProfilePreferencesSection({ draft, onChange }: ProfilePreferencesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-5">Appearance</h3>
        <div className="max-w-xs mb-5">
          <label className={labelClass} htmlFor="pref-theme">Theme</label>
          <select
            id="pref-theme"
            value={draft.theme}
            onChange={(e) => onChange({ theme: e.target.value as UserPreferences['theme'] })}
            className={inputBase}
          >
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="max-w-xs">
          <ToggleSwitch label="Compact Mode" checked={draft.compactMode} onChange={(v) => onChange({ compactMode: v })} />
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-5">Regional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="pref-date-format">Date Format</label>
            <select
              id="pref-date-format"
              value={draft.dateFormat}
              onChange={(e) => onChange({ dateFormat: e.target.value })}
              className={inputBase}
            >
              {DATE_FORMAT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="pref-time-format">Time Format</label>
            <select
              id="pref-time-format"
              value={draft.timeFormat}
              onChange={(e) => onChange({ timeFormat: e.target.value as UserPreferences['timeFormat'] })}
              className={inputBase}
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="pref-week-start">Week Starts On</label>
            <select
              id="pref-week-start"
              value={draft.weekStartsOn}
              onChange={(e) => onChange({ weekStartsOn: e.target.value as UserPreferences['weekStartsOn'] })}
              className={inputBase}
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-5">Behavior</h3>
        <div className="max-w-xs">
          <label className={labelClass} htmlFor="pref-landing">Default Landing Page</label>
          <select
            id="pref-landing"
            value={draft.defaultLandingPage}
            onChange={(e) => onChange({ defaultLandingPage: e.target.value })}
            className={inputBase}
          >
            {LANDING_PAGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { OrgWorkspaceDefaults } from '../../../store/organizationStore';
import { ToggleSwitch } from '../../common/ToggleSwitch';

const inputBase =
  'w-full rounded-lg bg-noir-600 text-white/80 text-sm px-3 py-2 focus:outline-none border border-white/[0.08] focus:border-jade transition-colors';
const labelClass = 'text-[11px] font-medium text-white/50 block mb-1.5';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const DASHBOARD_OPTIONS = ['Overview', 'Team Productivity', 'Trends', 'Status & Priority'];

interface OrgWorkspaceDefaultsSectionProps {
  draft: OrgWorkspaceDefaults;
  onChange: (patch: Partial<OrgWorkspaceDefaults>) => void;
}

export function OrgWorkspaceDefaultsSection({ draft, onChange }: OrgWorkspaceDefaultsSectionProps) {
  return (
    <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
      <h3 className="font-display font-bold text-sm text-white mb-5">Workspace Defaults</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div>
          <label className={labelClass} htmlFor="wd-status">Default Task Status</label>
          <select id="wd-status" value={draft.defaultTaskStatus} onChange={(e) => onChange({ defaultTaskStatus: e.target.value })} className={inputBase}>
            {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="wd-priority">Default Priority</label>
          <select id="wd-priority" value={draft.defaultPriority} onChange={(e) => onChange({ defaultPriority: e.target.value })} className={inputBase}>
            {PRIORITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="wd-view">Default Repository View</label>
          <select
            id="wd-view"
            value={draft.defaultRepositoryView}
            onChange={(e) => onChange({ defaultRepositoryView: e.target.value as OrgWorkspaceDefaults['defaultRepositoryView'] })}
            className={inputBase}
          >
            <option value="table">Table</option>
            <option value="grouped">Grouped</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="wd-dashboard">Default Analytics Dashboard</label>
          <select id="wd-dashboard" value={draft.defaultAnalyticsDashboard} onChange={(e) => onChange({ defaultAnalyticsDashboard: e.target.value })} className={inputBase}>
            {DASHBOARD_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="wd-theme">Default Theme</label>
          <select
            id="wd-theme"
            value={draft.defaultTheme}
            onChange={(e) => onChange({ defaultTheme: e.target.value as OrgWorkspaceDefaults['defaultTheme'] })}
            className={inputBase}
          >
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        <ToggleSwitch label="Notifications Enabled" checked={draft.notificationsEnabled} onChange={(v) => onChange({ notificationsEnabled: v })} />
        <ToggleSwitch label="Email Notifications" checked={draft.emailNotifications} onChange={(v) => onChange({ emailNotifications: v })} />
        <ToggleSwitch label="Desktop Notifications" checked={draft.desktopNotifications} onChange={(v) => onChange({ desktopNotifications: v })} />
      </div>
    </div>
  );
}

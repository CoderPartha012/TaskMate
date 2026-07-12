import React from 'react';
import { Bell, Mail, Monitor, MessageSquare } from 'lucide-react';
import { NotificationPreferences } from '../../../store/userProfileStore';
import { ToggleSwitch } from '../../common/ToggleSwitch';

interface ProfileNotificationsSectionProps {
  draft: NotificationPreferences;
  onChange: (patch: Partial<NotificationPreferences>) => void;
}

const NOTIFY_TYPES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'notifyTaskDueDates', label: 'Task Due Dates', description: 'Reminders for tasks due today or overdue' },
  { key: 'notifyTaskAssigned', label: 'Task Assigned to Me', description: "When you're assigned to a task" },
  { key: 'notifyComments', label: 'Comments & Mentions', description: 'New comments on tasks you follow' },
  { key: 'notifyStatusChanges', label: 'Status Changes', description: 'When a task status changes' },
  { key: 'notifyAIExecutions', label: 'AI Execution Results', description: 'When an AI task finishes running' },
  { key: 'notifyContractWorkflowAlerts', label: 'Contract & Workflow Alerts', description: 'SLA breaches, expiring contracts' },
  { key: 'weeklySummaryEmail', label: 'Weekly Summary Email', description: 'A digest of your week every Monday' },
];

export function ProfileNotificationsSection({ draft, onChange }: ProfileNotificationsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-jade" aria-hidden="true" />
          Delivery Channels
        </h3>
        <p className="text-xs text-white/40 mb-5">Choose how you'd like to be notified.</p>

        <div className="space-y-3 max-w-md">
          <div className="flex items-center justify-between bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white/75">
              <Mail className="w-3.5 h-3.5 text-white/35" aria-hidden="true" />
              Email Notifications
            </span>
            <ToggleSwitch checked={draft.emailNotifications} onChange={(v) => onChange({ emailNotifications: v })} />
          </div>
          <div className="flex items-center justify-between bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white/75">
              <Monitor className="w-3.5 h-3.5 text-white/35" aria-hidden="true" />
              Desktop Notifications
            </span>
            <ToggleSwitch checked={draft.desktopNotifications} onChange={(v) => onChange({ desktopNotifications: v })} />
          </div>
          <div className="flex items-center justify-between bg-noir-600 border border-white/[0.06] rounded-lg px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-white/75">
              <MessageSquare className="w-3.5 h-3.5 text-white/35" aria-hidden="true" />
              In-App Notifications
            </span>
            <ToggleSwitch checked={draft.inAppNotifications} onChange={(v) => onChange({ inAppNotifications: v })} />
          </div>
        </div>
      </div>

      <div className="bg-noir-700 border border-white/[0.06] rounded-xl p-6">
        <h3 className="font-display font-bold text-sm text-white mb-1">Notify Me About</h3>
        <p className="text-xs text-white/40 mb-5">Pick which events should trigger a notification.</p>

        <div className="space-y-1">
          {NOTIFY_TYPES.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-b-0">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white/80">{label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{description}</p>
              </div>
              <ToggleSwitch checked={draft[key]} onChange={(v) => onChange({ [key]: v })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
